---
title: 博客搭建
---

&nbsp;
这是个人第一次搭建博客，网上基本有全面的教程，这里附上一个比较全面的[知乎教程](https://zhuanlan.zhihu.com/p/80140564)。如果搭建过程中hexo init出现问题并且你是使用了VPN或者其他代理的可以考虑一下本文的解决方案。
&nbsp;



## 环境准备

### 安装git环境
官网下载一个[git](https://git-scm.com/download)
如果没有github账号，建议先去[官网](https://github.com/)注册github账号
我就比较懒了，有什么可以问题去[官网的教程](https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)看一看
&nbsp;
<!--more-->
### 安装node js环境
直接去中文官网下自己对应版本的就行：  [nodejs中文](http://nodejs.cn/download/)
安装嘛，就一路next不会错der
安装好之后就可以用npm命令装各种各种的包啦！
命令行输入之后显示版本号就没问题了
``` bash
$ npm -v
```
&nbsp;

&nbsp;
PS：如果用npm下载一些包比较慢并且没有梯子的话，建议换一下国内的阿里源下载

``` bash
$ npm config set registry https://registry.npm.taobao.org
```
&nbsp;
&nbsp;
### 安装hexo环境
接下来就是用npm安装hexo环境了，距离博客搭建仅一步之遥
首先建立一个新的**空文件夹**(注意要是空文件夹),另外建议在C盘下直接新建，网上说貌似不是二级目录可能会有些问题。
之后如图在该空文件夹(我的是blog)进入git bash
![](/images/1.png)
&nbsp;
&nbsp;
之后在git bash环境下安装(cmd也行),然后后`hexo -v`一下看有没有成功:
``` bash
$ npm install -g hexo-cli
$ hexo -v
```
&nbsp;
&nbsp;
然后依次执行下面命令，如果没问题，那就好办了！
``` bash
$ hexo init #初始化
$ hexo g #产生静态页面
$ hexo s #产生静态网页，在 http://localhost:4000 查看效果
```
很不幸的话如果init出现如下错误(我就是这样子)：
``` bash
$ fatal: unable to access 'https://github.com/***/***.git/': OpenSSL SSL_connect: Connection was reset in connection to github.com:443
```
&nbsp;
&nbsp;
原因是你开了VPN或者其他本地代理，然后你的git上面没有改端口。
你可以用一下命令看一看你的git的设置：
``` bash
git config --global http.proxy #查看git的http代理配置
git config --global https.proxy #查看git的https代理配置
git config --global -l #查看git的所有配置
```
然后怎么办呢？改你git的代理设置呗，和VPN一样就行。
``` bash
git config --global http.proxy 127.0.0.1:7890 #7890是我的VPN的代理端口
git config --global https.proxy 127.0.0.1:7890 #7890是我的VPN的代理端口
```
![](/images/2.png)
&nbsp;
&nbsp;
&nbsp;
改了之后就差不多了，之后想要改回来不用代理，如下unset就行：
``` bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```
&nbsp;
&nbsp;
## 将博客页面push到你的github上

### push push push!
&nbsp;
&nbsp;
改一下图中的配置文件就行
![](/images/4.png)
&nbsp;
&nbsp;
最后改成这样，图中的github ID改成你自己的DI即可
![](/images/3.png)
&nbsp;
&nbsp;
如果你想改成自己风格的博客或者去hexo官网找主题，可以参考这篇[博客](https://www.cnblogs.com/thanksblog/p/12900165.html)
&nbsp;
最后：
``` bash
$ hexo d
```
便可以成功将你的博客搭建在github上，之后通过 *你的用户名.github.io*即可看见你自己的博客了
&nbsp;
PS：可能，存在的一些小问题，如果你博客设置的branch和你的github上面默认的defaul branch不一致，你会看不到你更新的页面。改一下setting，始终一致即可。
&nbsp;
&nbsp;
##over!