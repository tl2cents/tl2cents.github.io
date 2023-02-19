from Crypto.Util.number import *
from random import getrandbits
from flag import flag

welcome="Welcome to VNCTF 2023!Hope you can enjoy this challenge!"
description='''These days DengFeng want to provide a surprise for Deebato.\n
So he come up with an idea...\n
That is...\n
Designing a DLP!\n
Namely Deebato Love Problem!'''
begin='''So let's go!\n
In 1997, I learned to drive a car...\n'''

def hello():
    print(welcome)
    print(description)
    print(begin)


def gen():
    a=2
    while True:
        p=getPrime(90)
        order=GF(p)(a).multiplicative_order()
        if isPrime(int(order)):
            return a,p,order
            

def get_msg(m,a,p,order):
    secret=getrandbits(85)
    c1=pow(a,secret,p)
    c2=pow(a,pow(secret,m,order),p)
    return secret,c1,c2


def main():
    alarm(300)
    hello()
    a,p,order=gen()
    print("OOOOOOh!I will give you something useful!")
    print(f"a = {a}")
    print(f"p = {p}")
    m=int(input("Please give me your choice:"))
    secret,c1,c2=get_msg(m,a,p,order)
    print("OK,here is my gift.")
    print(f"c1 = {c1}")
    print(f"c2 = {c2}")
    ticket=int(input("Please give me the secret:"))
    if ticket==secret:
        print("OKOK,it seems that you know Deebato Love Problem well.Here is my flag")
        print(flag)
    else:
        print("Sorry!You don't understand Deebato Love Problem not at all!I can't give you flag!")


try:
    main()
except Exception as e:
    print(f"Error : {e}")