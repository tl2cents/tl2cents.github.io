---
layout: blog
title: '密码学后门系列 1 : Dual EC'
date: 2023-04-20 22:21:08
tag
---

密码学后门研究系列博客第一篇：Dual EC，A Standardized Back Door，这是密码学界最臭名昭著的一个后门，由斯诺登事件彻底证实美国国家安全局 NSA 在设计时就故意留存了此后门。此后，密码学后门相关的论文都会反复鞭尸这一后门，足可见其在学术界的“重大意义”，笔者的本系列博客也将以这一后门开篇，展开叙述密码学后门在学术界的研究意义与方向。



## Dual EC: A Standardized Back Door

Dual EC 是美国国家安全局 (National Security Agency abbr. NSA）大力推行的一个随机数生成器算法，在进入标准化不久后，很多密码学家都怀疑这个算法可能存在后门，最终这个密码学后门由斯诺登事件公布出的 NSA 文件证实，在此之前，NSA 甚至专门资助 RSA 公司1000万美元推广自己的算法，RSA 的 BSAFE 库的默认伪随机数生成器算法就是 Dual EC 。在斯诺登事件曝光之后，NSA在密码学界就臭名昭著了，其后续牵头的若干貌似性能优异的算法都没能进入 ISO 国际标准化内，与此事件不无关系。有关 Dual EC 标准化推行背后的详细故事读者可以阅读这篇论文[^Dual EC 2015]。



## Dual EC 算法

![image-20230318222043342](C:\Users\31043\AppData\Roaming\Typora\typora-user-images\image-20230318222043342.png)

1. 初始化一个熵 $$s_0$$，可以是用户指定的 seed 或者来自其他的稳定随机熵（如`os.urandom`），更新内部状态为 $$s_1 = f(s_0)$$。
2. 每次需要产生随机数时，输出随机数 $$r_i = g(s_i)$$，计算 $s_{i+1} = f(s_i)$，更新内部状态。如果需要的比特数比较大，迭代更新至输出足够多的比特数。

在一般化的伪随机数生成器里，要求任意输出 $$r_i$$ 不会泄露内部状态以及下一个状态的任意信息（即$$s_i,s_{i+1}$$），否则攻击者就可以根据一次输出完全预测之后的所有输出，同样也不能通过多轮输出恢复内部状态，这要求 $$g$$ 必须是单向函数，并且不能有后门。作为很多密码学算法的底层元件，如果伪随机数生成器被完全预测了，其他的密码学算法（依赖PRNG）都会毫无安全性可言。

Dual EC的算法框架有两个，一个是2006年的初始版本，一个是2007年的改进版本。下图是初始的 Dual EC 版本：

![image-20230318222525614](C:\Users\31043\AppData\Roaming\Typora\typora-user-images\image-20230318222525614.png)



Dual EC 算法的设计很简单，选取有限域上 P-256 elliptic curve，记为 $$\textsf{E}$$，一般的椭圆曲线方程如下：
$$
\textsf{E} :\{(x,y) \ | \  y^2 = x^3 + ax + b \mod p \}
$$


上图中的 P，Q 是 $$\textsf{E}$$ 上随机的两个点，并且是公开的参数。其随机数产生过程如下：

1. 初始化一个 256 比特的熵 $$s_0$$，可以是用户指定的 seed 或者来自其他的稳定随机熵（如`os.urandom`），更新内部状态为 $$s_1 = x(s_0 \cdot P)$$。其中 $$x(s_0 \cdot P)$$ 代表取曲线上点 $$s_0 \cdot P$$ 的 x 坐标，下述符号均表此意。
2. 每次需要产生随机数时，输出随机数 $$r_i = x(s_i \cdot Q)$$，取 $$r_i$$ 的低240比特作为最终输出，计算 $s_{i+1} = x(s_i \cdot P)$，更新内部状态。如果需要的比特数比较大，迭代更新至输出足够多的比特数。

上述的 $$x(s_i \cdot P)$$ 函数是密码学意义上安全的单向函数，因为它基于数学困难问题  $$\textsf{ECDLP}$$，只要曲线参数选取是恰当的，上述伪随机数生成器就是安全的。自 Dual EC 推行起，许多密码学家对该算法进行了研究，普遍认为该算法性质不佳，在**不考虑潜在后门**的情况下主要有以下几点：

1. 伪随机数生成器速度很慢，主要是对椭圆曲线上的点进行标量乘法很慢，而该算法每更新一次状态就要进行两次点的标量乘法。
2. 伪随机数生成器产出的随机数质量差，伪随机数生成器设计的一个原则就是保证输出要尽量像真随机序列靠近，不可预测，不能有偏差（01比特数基本一致）。而 Dual EC 输出的序列有明显的偏差。

而就是设计如此糟糕的伪随机数生成器却被 NSA 强行塞进了 NIST、ISO、ANSI等众多国际标准内，并且进行了大规模使用，很难不多想这之后有什么py交易。

所有这些设计都是为了后门服务：Nobody-But-Us ( NOBUS ) Backdoors，这和学术界的 SETUP (Secretly Embedded Trapdoor with Universal Protection) 后门是类似的，它是一种只有设计者知道的后门，而其他人即使可能发觉后门存在，也没法获得后门或者证明设计者拥有后门。如果不是斯诺登事件的文件证实了 Dual EC 设计的时候就留存了后门，就没有实质性证据可以指控 NSA。



## Basic Dual EC Backdoor

回看 Dual EC 算法，  $$\textsf{ECDLP}$$ 在非量子的情境下其安全性毋庸置疑，那么问题在于 $$\textsf{P,Q}$$ 是如何选择的？真如设计者所言是随机选择的吗？假设设计者知道有限域上椭圆曲线两个点的关系 $$P = d \cdot Q$$ ，即有：
$$
r_i = x(s_i \cdot Q)  \\
s_{i+1} = x( s_i \cdot P) = x(s_i * d \cdot Q)
$$
如果我们根据 $$r_i$$ 恢复出对应曲线上可能的点 $$R_i$$，那么：
$$
s_{i+1} = x(s_i * d \cdot Q) = x(d \cdot R_i)
$$
这意味着，如果算法设计者留存了后门 d ，通过一次输出，就可以完全恢复出下一个伪随机数生成器的内部状态，从而预测整个伪随机数生成器的输出。这里需要说明的是每次输出的比特将 $$r_i$$ 的高16位丢弃了，再加上每个 $$r_i$$ 横坐标可能对应两个 $$\textsf{E}$$ 上的点（$$\mathbb{Z}_p$$ 上两个二次剩余），总计需要爆破的空间最多只有 $$2^{17}$$，这在现代计算机上是完全可行的。

上述可能的后门被提出来之后，NSA 声称他们产生的 $$\textsf{P,Q}$$ 是完全随机无后门的，**但是谁愿意使用存在潜在后门漏洞的算法呢？**



## Dual EC 2006

实际上，Dual EC 2006 的标准版本有附加算法选项，如果用户愿意，第一次输出的时候，内部状态在翻转之前都异或一个额外的输入值 $$\textsf{adin}_i$$ （比如当前时间戳、计数器等，在用户不显示指定参数时，默认异或值为0）。如下图

![image-20230319213459059](C:\Users\31043\AppData\Roaming\Typora\typora-user-images\image-20230319213459059.png)

<center><b>Figure 5.3 Dual EC 2006</b></center>



此时，由于额外的异或输入，即使攻击者知道后门 d 并且能够猜出额外输入 $$\textsf{adin}$$ ，由第一个输入推算出内部状态已经不可行。但是 Dual EC 2006 算法设计很奇怪的一个点又出现了，**上图对算法阐述是很模糊的**，笔者参考 NIST 公布的标准 [^NIST SP 800-90A] 第67页，**认为在不给出算法准确描述的情况下，论文给出的上图是颇具误导性质的**，这里2006年公布的算法在获取随机数时的算法概述如下：

- 假定初始状态是 $$s$$ , 用户指定的额外输入：$$\textsf{adin}$$ ，此次需要获取的随机数长度为 $$\ell$$。
- 在获取第一轮输出时，用户得到 $$r = x(s \cdot Q)$$，状态更新为 $$s = x(s \oplus \textsf{adin} \cdot P )$$。同时 $$\textsf{adin} = 0$$。
- 如果已获取随机串长度小于目标长度 $$\ell$$ ，返回第二步，否则算法结束。

上述伪随机数生成算法显然是反逻辑的、反密码学直觉的，用**户的额外输入居然只在第一轮输出后就置0，那么后续轮次的算法和上节的 Basic Dual EC 是完全一致的，增加的参数也就失去了意义，笔者一个直觉性的想法是第二步的 $$\textsf{adin}$$ 保持不变或者进行更新是最好的，这样杜绝了内部状态恢复的可能性。而这样糟糕的设计也还是为了方便密码学后门的利用**。因此只要某次请求能够得到的输出大于两轮输出（60字节），仍旧可以轻松获取到内部状态。

后门攻击仍然存在，在 Figure 5.3 中，第一次请求的随机比特数少于240比特，因此无法利用，但是第二次请求获取的比特数是480比特，攻击者能够获得两次连续的随机数输出，即 $$r_2,r_3$$，得到对应的点 $$R_2 = (r_2^{\prime} \ , \ y_2) \ , \  R_3 = (r_3^{\prime}\ , \ y_3)$$ 。则：
$$
R_3 = x(s_3 \cdot Q) \\
R_2 = x(s_2 \cdot Q) \\ 
s_3 = x(s_2 \oplus \textsf{adin}_3 \cdot P)
$$
在第二轮时， $$\textsf{adin}_3 = 0$$ , 于是 $$s_3 = x( (s_2 \oplus \textsf{adin}_3)*d \cdot Q ) = x(d \cdot R_2)$$，即能够完全恢复伪随机数生成器的内部状态。



## Dual EC 2007

2007 年的时候又对 Dual EC 进行了简单修改，但是换汤不换药，后门高高吊，很难不让人怀疑设计者是故意保留后门的可利用性的。2007 年修改后的版本是这样的：

![image-20230319231945945](C:\Users\31043\AppData\Roaming\Typora\typora-user-images\image-20230319231945945.png)

与2006年版本的区别在于：每一次获取随机数时，初始状态都不会输出，而是：初始状态会和用户的额外输入进行异或，更新内部状态后，再进行输出，（**注意，仍然不是每次更新内部状态的时候更新**）。

这样，攻击者仍然可以通过一次大于等于60字节的输出，获取到内部状态，但是之后每次获取预测值都要猜用户的额外输入时什么。后门利用和 Dual EC 基本是一样的，**只不过这样的设计使得 Dual EC 效率和速度更慢了，安全性却没有什么实质性提升。**足可见设计者居心叵测。

额外提一点是 Dual EC 的前向安全性，这里不指抗量子攻击的前向安全性， Dual EC 在量子情境下安全假设是不存在的， 因为 ECDLP 是可解的；这里的前向安全性指的是经典情境下的不可回溯性。即知道某次输出对应的内部状态，不能够回溯之前的内部状态、获取之前的输出。



## Exploit in Real Life Protocols

具体攻击细节参考：`On the practical exploitability of Dual EC in TLS implementations`[^Dual EC Exploit Usenix 2014]。使用了 Dual EC 算法的库：

- RSA Security’s BSAFE-C （默认PRNG）
- RSA Security’s BSAFE-Java （默认PRNG）
- Microsoft’s SChannel
- OpenSSL-FIPS (a FIPS-validated version of OpenSSL)

其中比较有趣的一个库是  OpenSSL-FIPS , 有一个严重的bug，如果设置使用 Dual EC，会导致它的`self-test` 一直不会通过，但是OpenSSL-FIPS发布后一直没有相关的bug报告过，也就是说基本没有人在 OpenSSL-FIPS 里面使用 Dual EC 或者是用户自己修复了bug但是没有报告。

为了利用后门，需要替换这些库内的P,Q点为已知 d 的 P，Q点： $$P = d \cdot Q$$，这些库只有OpenSSL是开源的，因此论文作者对其他三个库链接文件进行了逆向patch。经过利用测试，结果如下：

![image-20230320144625525](C:\Users\31043\AppData\Roaming\Typora\typora-user-images\image-20230320144625525.png)

- OpenSSL-fixed 是唯一一个为每个随机输出请求使用额外输入字符串的库，因此需要猜测adin，从而增加了基本攻击的代价，其他三个库没有使用任何adin。
- BSAFE-Java、BSAFE-C 和 OpenSSL-fixed 实现了 Dual EC 2007，在每次调用结束时都有额外的更新步骤。SChannel 设计初衷是实现 Dual EC 2007，但最后是与 Dual EC 2006 等价的：SChannel 虽然计算额外的状态更新，但丢弃其结果并继续使用前一个状态。
- Dual EC 实现之间的另一个区别是 BSAFE-C 为连续调用缓冲了上一次未使用的随机字节，**最大化利用了输出，同时方便了后门攻击。**
- 除了 Dual EC 实现中的差异之外，TLS协议的实现也很大程度影响 Dual EC 后门的利用。默认情况下，**每个库生成不同数量的随机值，在 TLS协议握手中以不同的顺序使用随机值，并使用不同的密码套件。**

本文不详细叙述 TLS握手的流程，但是重点在于密钥交换中双方会发送由 Dual EC 产生消息，比如 TLS 临时会话密钥交换过程中的握手，就需要用 Dual EC 依次产生：session ID, the server random, the
ephemeral secret $$a$$, and (depending on the cipher suite) the signature nonce。**如果根据 session ID 就可以恢复 Dual EC 的内部状态，显然，攻击者就能够全部恢复服务端的密钥。**

- BSAFE：对于使用 DHE 的TLS连接，服务端使用内部缓冲机制按顺序请求： 32字节的会话ID, 28字节的服务端随机数，20字节的临时密钥。
- BSAFE-C ：可知 30 bytes nonce，从而穷举空间是 $$2^{16}$$
- BSAFE-Java : 可知 28 bytes 服务端随机数，从而穷举空间是 $$2^{32}$$
- SChannel TLS过程：首先请求32个字节的session ID，但并没有让攻击者可以使用所有这些 : 在传输之前高4个字节的模20000。然后它为秘密临时密钥请求40字节，28字节的服务器端随机值；最后，32字节的秘密 ECDSA nonce。
- SChannel I ： 可多次握手，可以使用上一次握手28字节的服务器端随机值进行攻击，穷举空间 $$2^{32}$$。
- SChannel II ： 单次握手，只能使用session ID，我们知道其高32位模20000的值，即 session ID 高 32 位内穷举空间最大是 $$2^{18}$$，我们对每个可能的 session ID 还需要猜测其在 Dual EC 过程中被丢弃的高16比特，因此总穷举空间是 ： $$2^{34}$$。
- OpenSSL 在 Dual EC 的每个随机数据请求中使用一个额外的输入字符串，以刷新内部状态的随机性。该附加项是当前系统时间(以秒为单位)、当前系统时间(以微秒为单位)、一个单调增加的32位计数器和进程ID的组合。攻击者知道当前系统时间(以秒为单位)，因为它包含在TLS握手中。但是，adin的剩余位数需要攻击者额外猜测。
- OpenSSL-fixed I ： 假设攻击者知道整个adin；因此，只需要猜测会话 ID 缺失的16位，总穷举空间是 ： $$2^{16}$$。。
- OpenSSL-fixed II ： 假设攻击者知道计数器 （猜测TLS握手时为0） 和进程ID（因为它可能取决于 BIOS 期间系统服务启动的顺序 ) 。然后攻击者只需要重新计算当前微秒的adin计算；这最多需要100万次猜测。总穷举空间即 $$2^{20+16} = 2^{36}$$。
- OpenSSL III ：计数器和进程ID均未知，未知比特数为 k，则穷举空间即 $$ 2^{36 + k}$$。



## 后门解决方法

笔者认为可行的后门解决方法如下（当然，最佳方案是不使用 Dual EC）：

1. 可验证来源的随机椭圆曲线点（如利用哈希生成点坐标）
2. 每轮输出后更新 $$\textsf{adin} = f(\textsf{adin})$$ ，而不是直接置为 0，最简单的方式是设置为计数器 ： $$f : \textsf{adin} = \textsf{adin} + 1$$.
3. 选取 P，Q 来自不同的曲线，即 $$P \in ECC(p_1,a_1,b_1,c_1),Q \in ECC(p_2,a_2,b_2,c_2)$$。



## 参考链接

[^Dual EC 2015]:  Dual EC: A Standardized Back Door  https://projectbullrun.org/dual-ec/documents/dual-ec-20150731.pdf
[^Dual EC Exploit Usenix 2014]: On the Practical Exploitability of Dual EC in TLS Implementations https://www.usenix.org/system/files/conference/usenixsecurity14/sec14-paper-checkoway.pdf
[^NIST SP 800-90A]: Recommendation for Random Number Generation Using Deterministic Random Bit Generators http://csrc.nist.gov/publications/nistpubs/800-90A/SP800-90A.pdf









