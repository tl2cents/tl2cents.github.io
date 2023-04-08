# -*- coding: UTF-8 -*-
# https://github.com/tl2cents/Little-Cases
import os
from plistlib import InvalidFileException
import re
import shutil
import sys
import getopt

def is_url_path(path):
    if "http://" in path or "https://" in path:
        return True
    # assert os.path.isfile(path),"not a legal file path"
    return False

def is_valid_FilePath(path):
    return os.path.isfile(path)

def find_img(data,url=False):
    # All the img path is in the form of "[](path)"
    # URL images not considered
    ls=re.finditer("\\]\\(",data)
    data_len=len(data)
    res_list=[]
    for each in ls:
        i=each.end()
        path=""
        while i<data_len and data[i]!=")":
            path+=data[i]
            i+=1
        # remove extra space
        path=path.strip()
        if url==False and is_url_path(path):
            continue
        elif is_valid_FilePath(path):
            res_list.append(path)
        else:
            raise InvalidFileException(f"File {path} doesn't exist!")

    ls=re.finditer("img +src=",data)
    for each in ls:
        # skip "
        i=each.end()
        while i<data_len and data[i]!="\"":
            i+=1
        path=""
        i+=1
        while i<data_len and data[i]!="\"":
            path+=data[i]
            i+=1
        # remove extra space
        path=path.strip()
        if url==False and is_url_path(path):
            continue
        elif is_valid_FilePath(path):
            res_list.append(path)
        else:
            raise InvalidFileException(f"File {path} doesn't exist!")
    return res_list

def remake_md_img_path(md_path,img_target_dir,md_target_path,url=False,current_dir=False):
    # input all the imgs into the target directory : img_target_dir under the current directory
    md_data=open(md_path,"r",encoding="utf8").read()
    img_paths=find_img(md_data,url)
    if current_dir:
        target_dir="./"+img_target_dir
    else:
        target_dir=img_target_dir
    if not os.path.exists(target_dir):
        try:
            os.makedirs(target_dir)
        except:
            print("Fail to make dir : ",target_dir)
            exit(0)
    for img_path in img_paths:
        _,file_name=os.path.split(img_path)
        try:
            shutil.copy(img_path,target_dir)
        except:
            print("Fail to move img : ",img_path)
            exit(0)
        md_data=md_data.replace(img_path,target_dir+"/"+file_name)
    try:
        open(md_target_path,"w",encoding="utf8").write(md_data)
    except:
        print("Fail to write md to the target file path : ",md_target_path)
        exit(0)
    return None
    
if __name__ == "__main__":
    args=sys.argv[1:]
    argv=sys.argv[0]
    imgdir="./img"
    help_message="""
    -i <inputfile> [ifile= ] : the source markdown file
    -o <outputfile> [ofile= ] : the new rearranged markdown file
    -m <images dir> [imgdir= ]: the imgs will be copied to this directory, the default is "./img"
    """
    try:
        opts, args = getopt.getopt(args,"hi:o:m:",["ifile=","ofile=","imgdir="])
    except getopt.GetoptError:
        print(f'usage {argv} -i <inputfile> -o <outputfile> -m <imgdir>')
        print(help_message)
        sys.exit()
    
    print("Parsing Parameters.")
    for opt, arg in opts:
        if opt == '-h':
            print(f'usage {argv} -i <inputfile> -o <outputfile> -m <imgdir>')
            print(help_message)
            sys.exit()
        elif opt in ("-i", "--ifile"):
            inputfile = arg
        elif opt in ("-o", "--ofile"):
            outputfile = arg
        elif opt in ("-m","--imgdir"):
            imgdir = arg
        else:
            print(f"Invalid parameters. {opt} {arg}")
            sys.exit()
    
    print(f"[+]Inputfile is :  {inputfile}")
    print(f"[+]Outputfile is: {outputfile}")
    print(f"[+]Target img_dir is: {imgdir}")
    remake_md_img_path(inputfile,imgdir,outputfile)
    print("All done")
    # remake_md_img_path("./test_case.md","test_dir","./remake.md")