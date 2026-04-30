---
tags: FFT NTT Polynomial Post-Quantum-Cryptography
title: "快速傅里叶变换与数论变换"
key: fast-fourier-transform
lang: zh
bilingual: true
published: true
---

{: .info}
**概要:** 快速傅里叶变换（Fast Fourier Transform）普遍认为由 Cooley 和 Tukey 在 1965 年提出，但是其最早的思想可追溯到 Gauss 约 1805 年的未刊手稿。快速傅里叶变换是几乎目前所有高性能计算的基础算法，可以有效加速整数乘法以及多项式乘法，被 IEEE 誉为 20 世纪十大算法之一。目前 NIST 后量子密码标准化中的 Kyber、Dilithium、Falcon 等方案均涉及快速傅里叶变换和它的应用变体快速数论变换（NTT）。除此之外，在零知识证明协议（比如 Plonk 协议）、全同态加密（比如 BFV，TFHE）中，NTT 都是它们落地应用必不可少的关键加速算法。本文详细介绍快速傅里叶变换与数论变换数学的理论与实际的应用价值。

<!--more-->

---

{% plain error title="参考链接" %}

1. Fast Fourier Transform, CP-Algorithms: <https://cp-algorithms.com/algebra/fft.html>.
2. A note on NTT definitions and implementations: <https://eprint.iacr.org/2024/585.pdf>.
3. Number Theoretic Transform, Cryptography Caffe: <https://cryptographycaffe.sandboxaq.com/posts/ntt-02/>.
4. Survey reference: <https://arxiv.org/pdf/2211.13546>.

{% endplain %}




## 离散傅里叶变换

记一个 $$n-1$$ 次多项式为

$$
A(x) = a_0 x^0 + a_1 x^1 + \dots + a_{n-1} x^{n-1}
$$

特别地，我们假定多项式次数（系数向量的长度）为 $$n = 2^k$$，在非 2 次幂情形下，我们可以补齐高次零系数直到系数向量的长度等于 2 的次幂。记 $$n$$ 次单位元为 $$w_{n,k} = e^{\frac{2 k \pi i }{n}} $$，其中 $$k \in [0..n-1]$$，本原单位元为 $$w_{n} = w_{n, 1} = e^{\frac{2 \pi i }{n}}$$，它们均满足 $$x^n = 1$$。

多项式的系数向量表示方式是最常见的，即上面的 $$\vec{A} = (a_0, a_1, \ldots, a_{n-1})$$。离散傅里叶变换是一种特殊的点值表示，即将多项式表示为特殊的 $$n$$ 次单位元的点值向量：

$$
\begin{aligned}
\hat{A} &= \mathsf{DFT}(\vec A) = \mathsf{DFT}(a_0, a_1, \dots, a_{n-1})\\
&= (A(w_{n, 0}), A(w_{n, 1}), \dots, A(w_{n, n-1})) \\
&= (A(w_n^0), A(w_n^1), \dots, A(w_n^{n-1})) \\
&:= (y_0, y_1, \dots, y_{n-1}) \\
\end{aligned}
$$

逆离散傅里叶变换本质就是将多项式的点值表示转换成一般的向量形式，这个变换另一个更为人所知的说法是多项式的拉格朗日插值算法。故（逆）离散傅里叶变换就是将这两种表示方式进行相互转换的算法。即下面的映射：

$$
\begin{cases}
\mathsf{DFT}_{n}: \underbrace{(a_0, a_1, \ldots, a_{n-1})}_{\text{coefficient form}} \mapsto \underbrace{(y_0, y_1, \ldots, y_{n-1})}_{\text{evaluation form}} \\
\mathsf{iDFT}_{n}: \underbrace{(y_0, y_1, \ldots, y_{n-1})}_{\text{evaluation form}} \mapsto \underbrace{(a_0, a_1, \ldots, a_{n-1})}_{\text{coefficient form}} \\
\end{cases}
$$

{% plain error title="基于 DFT 的多项式乘法" %}
记多项式  $$A(x) = a_0 x^0 + a_1 x^1 + \dots + a_{n-1} x^{n-1}$$ 和 $$B(x) = b_0 x^0 + b_1 x^1 + \dots + b_{n-1} x^{n-1}$$ 是任意环上的 $n-1$ 次多项式，则我们知道：

$$
\mathsf{DFT}(A(x)) \circ \mathsf{DFT}(B(x)) = \mathsf{DFT}(A(x) \cdot B(x))
$$

其中 $$\circ$$ 代表向量的按位乘法，可以在 $$\mathcal{O}(n)$$ 的时间复杂度内计算。如果我们可以在 $$\mathcal{O}(n \log n)$$ 时间内计算离散傅里叶变换 $$\mathsf{DFT}$$ 和其逆变换 $$\mathsf{iDFT}$$，则我们就可以在 $$\mathcal{O}(n \log n)$$ 时间内完成系数向量形式的多项式乘法。令 $$m \ge 2n - 1$$ 为变换长度，通常在 FFT 中取 $$m$$ 为不小于 $$2n-1$$ 的最小 2 次幂，则：

$$
A(x) \cdot B(x) = \mathsf{iDFT}_{m} \left(\mathsf{DFT}_{m} \left(A\left(x\right)\right) \circ \mathsf{DFT}_{m} \left(B\left(x\right)\right)\right)
$$

这就是快速傅里叶变换和数论变换对于多项式乘法、整数乘法加速的核心思想。上面的计算中，我们需要将多项式的系数进行零填充到长度 $$m$$，因为最终结果 $$A(x)\cdot B(x)$$ 的次数为 $$2(n - 1)$$，共有 $$2n-1$$ 个系数，所以至少需要 $$2n-1$$ 维度的向量才能完全恢复 $$A(x)\cdot B(x)$$。
{% endplain %}


## 卷积与傅里叶变换

在通信领域，傅里叶变换（**Continuous Time Fourier Transform** ）通常是研究连续信号的强有力的工具，将连续的时域上的信息转换为频率信息或者频谱：

$$
S(f) = \int_{-\infty}^{\infty} s(t) \cdot e^{-i2\pi ft} \, dt
$$

而在现有的计算机下，模拟完全连续的时域信号是不可能的，因此离散的傅里叶变换在实际应用中的价值更高，于是就衍生了离散（时间）傅里叶变换。


1. **离散傅里叶变换 (DFT)** 将一组复数序列 $$\{x_n\} := x_0, x_1, \dots, x_{N-1}$$ 转换为另一组等长的复数序列 $$\{X_k\} := X_0, X_1, \dots, X_{N-1}$$。其正变换 (Forward DFT) 数学定义如下：

   $$
   X_k = \sum_{n=0}^{N-1} x_n \cdot e^{-i 2\pi \frac{k}{N} n}, \quad k = 0, \dots, N-1
   $$

   其中 $$x_n$$ 是时域中的采样信号，$$X_k$$ 是频域中的频率分量，$$N$$ 是序列长度。$$e^{-i 2\pi \frac{k}{N} n}$$ 是复指数基函数，根据欧拉公式可以展开为 $$\cos(2\pi \frac{k}{N} n) - i \sin(2\pi \frac{k}{N} n)$$。

2. **离散傅里叶逆变换 (Inverse DFT)** 将频域序列还原回时域序列：
   
   $$
   x_n = \frac{1}{N} \sum_{k=0}^{N-1} X_k \cdot e^{i 2\pi \frac{k}{N} n}, \quad n = 0, \dots, N-1
   $$
   
   需要注意的是，信号处理中的 Forward DFT 通常使用负指数约定，而本文在多项式求值视角下使用正指数约定 $$y_k=\sum_{j=0}^{n-1}a_j w_n^{kj}$$。二者互为共轭方向，只要正逆变换保持一致即可。


切换回多项式的视角，我们其实可以得到下面不太精准的规约：

| 时域表达形式                           | 离散傅里叶变换后                    | 傅里叶变换的实际意义                                         |
| -------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| 波的时域连续信号                       | **频谱信息** (频率、幅度、相位)     | **波频率拆解与成分分析**：将叠加的波还原为单一频率的正弦波，方便计算波的叠加和频谱信息 |
| 多项式的系数向量 | 多项式的点值表达（evaluation form） | **加速多项式乘法**：类比波叠加，允许快速计算卷积，即乘法     |

本质上，**卷积与乘法是对等的：** 两个多项式相乘，本质上就是它们的系数序列在做**线性卷积**。为了方便后续说明 NTT 的概念，我们这里直接考虑整数商环 $$\mathbb{Z}_q[x]$$。


{% definition title="多项式乘法" %}
 给定交换环 $$\mathbb{Z}_q[x]$$ 上的两个 $$n-1$$ 次多项式 $$G(x)$$ 和 $$H(x)$$ ，其中 $$q \in \mathbb{Z}$$， $$x$$ 为多项式变量, 则 $$G(x)$$ 与 $$H(x)$$ 的乘法定义为:

$$
Y(x)=G(x) \cdot H(x)=\sum_{k=0}^{2(n-1)} y_k x^k
$$

新的系数 $$y_k=\sum_{i=0}^k g_i h_{k-i} \bmod q$$，其中$$\boldsymbol{g}$$ 和 $$\boldsymbol{h}$$ 分别为多项式 $$G(x)$$ 和 $$H(x)$$ 的系数向量。


{% enddefinition %}

{% definition title="线性卷积 Linear Convolution" %}
 令长度均为 $$n$$ 的向量 $$\mathbf{g} = \{g_0, g_1, \dots, g_{n-1}\}, \mathbf{h} = \{h_0, h_1, \dots, h_{n-1}\}$$， 其线性卷积 $$\mathbf{y} = \mathbf{g} * \mathbf{h}$$ 定义为： 

$$
y_k = \sum_{i} g_i h_{k-i}
$$

其中结果向量 $$\mathbf{y}$$ 的长度为 $$2n-1$$，元素索引 $$k \in \{0, 1, \dots, 2n-2\}$$。 对于每一个 $$k$$，求和范围需满足 $$0 \le i < n$$ 且 $$0 \le k-i < n$$。

{% enddefinition %}

> 可以很容易地验证上述线性卷积等价于多项式乘法，而经过离散傅里叶变换后的点值形式的多项式，可以更方便地进行卷积运算。不局限于线性卷积，还有密码学上经常用到的循环卷积函数：
>
> - 正循环卷积（PWC）：等价于多项式商环 $$\mathbb{Z}_q[x] / (x^n - 1)$$ 上的乘法运算
> - 负循环卷积（NWC）：等价于多项式商环 $$\mathbb{Z}_q[x] / (x^n + 1)$$ 上的乘法运算

{% definition title="循环卷积 Cyclic Convolution / Positive Wrapped Convolution" %}
 在多项式商环 $$\mathbb{Z}_q[x] / (x^n - 1)$$ 上有两个次数为 $$n - 1$$ 的多项式 $$G(x)$$ 和 $$H(x)$$，系数向量分别为： $$\mathbf{g} = \{g_0, g_1, \dots, g_{n-1}\}, \mathbf{h} = \{h_0, h_1, \dots, h_{n-1}\}$$，其循环卷积 $$\mathbf{y} = \mathbf{g} \circledast \mathbf{h}$$ 的第 $$k$$ 个元素定义为： 

$$
y_k = \sum_{i=0}^{n-1} g_i \cdot h_{(k-i) \pmod n} \\
\iff y_k = \sum_{i=0}^{k} g_i \cdot h_{k-i} + \sum_{i=k + 1}^{n-1} g_i \cdot h_{k + n - i}
$$

其中 $$k \in \{0, 1, \dots, n-1\}$$。该向量计算结果等价的多项式表达形式为： 

$$
Y(x) = G(x) \cdot H(x) \pmod{x^n - 1}
$$

{% enddefinition %}

{% definition title="负循环卷积 Negacyclic Convolution" %}
  在商环 $$\mathbb{Z}_q[x] / (x^n + 1)$$ 上有两个次数为 $$n - 1$$ 的多项式 $$G(x)$$ 和 $$H(x)$$，系数向量分别为： $$\mathbf{g} = \{g_0, g_1, \dots, g_{n-1}\}, \mathbf{h} = \{h_0, h_1, \dots, h_{n-1}\}$$，其负循环卷积 $$\mathbf{y} = \mathbf{g} \star \mathbf{h}$$ 的第 $$k$$ 个元素定义为： 

$$
y_k = \left( \sum_{i=0}^{k} g_i h_{k-i} - \sum_{i=k+1}^{n-1} g_i h_{k+n-i} \right)
$$

其中 $$k \in \{0, 1, \dots, n-1\}$$。该向量计算结果等价的多项式表达形式为： 

$$
Y(x) = G(x) \cdot H(x) \pmod{x^n + 1}
$$

{% enddefinition %}


> **负循环卷积**（Negacyclic Convolution），也常被称为**负向折叠卷积**（Negative Wrapped Convolution, NWC），是格密码（如 Kyber, Dilithium）和全同态加密中最为核心的加速运算。


## 快速傅里叶变换

那么如何实现 $$\mathcal{O}(n \log n)$$ 复杂度的 $$\mathsf{DFT}$$ 和 $$\mathsf{iDFT}$$。我们知道，一般的点值计算复杂度为 $$\mathcal{O}(n)$$，因此朴素的 $$\mathsf{DFT}$$ 复杂度为 $$\mathcal{O}(n^2)$$，朴素的拉格朗日插值算法的复杂度也是 $$\mathcal{O}(n^2)$$，而快速傅里叶变换的核心在于点值表示中的特殊的单位元基点向量：

$$
\vec w = (w_{n,0}, w_{n,1}, \ldots, w_{n,n-1}) = (w_n^0, w_n^1, \ldots, w_n^{n-1})
$$

其核心的算法思想就是分而治之（divide and conquer）。我们知道：

$$
\begin{aligned}
A(x) &= a_0 x^0 + a_1 x^1 + \dots + a_{n-1} x^{n-1} \\
&= a_0 x^0 + a_2 x^2 + \dots + a_{n-2} x^{n-2} +  x(a_1 x^0 + a_3 x^2 + \dots + a_{n-1}x^{n-2}) \\
&= A_0(x^2) + xA_1(x^2)
\end{aligned}
$$

其中 $$A_0(x), A_1(x)$$ 都是只有 $$\frac{n}{2}$$ 个系数的多项式，满足：

$$
\begin{aligned}
A_0(x) &= a_0 x^0 + a_2 x^1 + \dots + a_{n-2} x^{\frac{n}{2}-1} \\
A_1(x) &= a_1 x^0 + a_3 x^1 + \dots + a_{n-1} x^{\frac{n}{2}-1}
\end{aligned}
$$

### DFT 算法 $$\mathcal{O}(n \log n)$$ 

{% plain info title="DFT 快速离散傅里叶变换" %}
给定一个 $$n-1$$ 次多项式的系数向量 $$\vec{A} = (a_0, a_1, \ldots, a_{n-1})$$，对应多项式 

$$
A(x) = a_0 x^0 + a_1 x^1 + \dots + a_{n-1} x^{n-1}.
$$

如何在 $$\mathcal{O}(n \log n)$$  时间内计算出它在 $$n$$ 次单位元 $$\vec w = (w_{n,0}, w_{n,1}, \ldots, w_{n,n-1})$$ 上的值 $$\left(y_0, y_1, \ldots, y_{n-1}\right)$$，其中 $$y_i = A\left(w_{n,i}\right)$$。

{% endplain %}

定义 $$T_{\mathsf{DFT}}(n)$$ 为计算 $$n$$ 次多项式的离散傅里叶变换的时间复杂度，根据分解 $$A(x) = A_0(x^2) + xA_1(x^2)$$，如果我们可以根据已知的 $$A_0, A_1$$ 的 $$\mathsf{DFT}$$ 向量，在 $$O(n)$$ 时间内得到 $$A$$ 的 $$\mathsf{DFT}$$ 向量。则我们知道它的复杂度满足下面的递归关系：

$$
T_{\mathsf{DFT}}(n) = 2T_{\mathsf{DFT}}(\frac{n}{2}) + \mathcal{O}(n)
$$

由递归算法的[主定理](https://en.wikipedia.org/wiki/Master_theorem_(analysis_of_algorithms))，我们知道该递归算法的最终时间复杂度为 $$\mathcal{O}(n \log n)$$。一个关键的观察在于 $$n$$ 次单位元向量平方后的 $$\vec w^2 = (w_n^0, w_n^2, \ldots, w_n^{2(n-1)})$$  就是所有的 $$\frac{n}{2}$$ 次的单位元，因此 $$A_0(x), A_1(x)$$ 的点值表示中的输入模式与 $$A(x)$$ 恰好是匹配的。具体来说，假如我们已知 $$A_0(x), A_1(x)$$ 和离散傅里叶变换：

$$
\begin{cases}
\left(y_k^0\right)_{k=0}^{n/2-1} = \mathsf{DFT}(A_0) \\
\left(y_k^1\right)_{k=0}^{n/2-1} = \mathsf{DFT}(A_1)
\end{cases}
$$

注意到单位元的特殊性：

$$
\begin{cases}
w_{n}^{2k} = e^{\frac{2\pi k i}{n/2}} =  w_{n/2}^{k} & k \in [0, n/2 - 1] \\
w_{n}^{k + \frac{n}{2}}= - w_{n}^{k} &  k \in [0, n - 1]
\end{cases}
$$

因此 $$\mathsf{DFT}(A)$$ 的 $$n$$ 点值表示的向量值可以通过如下方式恢复：

$$
\begin{cases}
y_k = A_0(w_n^{2k}) + w_n^{k} \cdot A_1(w_n^{2k}) =  y_k^0 + w_n^k y_k^1, & k = 0, \ldots, \frac{n}{2} - 1. \\

y_k = A_0(w_n^{2k}) + w_n^{k} \cdot A_1(w_n^{2k}) = y_{k \bmod \frac{n}{2}}^{0} + w_n^{k} y_{k \bmod \frac{n}{2}}^{1}  & k = \frac{n}{2}, \ldots, {n} - 1. \\
\end{cases}
$$

写成比较优雅的表达式就是：

$$
\begin{cases}
y_k &= y_k^0 + w_n^k y_k^1, &\quad k = 0 \dots \frac{n}{2} - 1, \\
y_{k+n/2} &= y_k^0 - w_n^k y_k^1, &\quad k = 0 \dots \frac{n}{2} - 1.
\end{cases}
$$

上述公式也被称之为蝴蝶公式，整个递归表达式非常优雅，根据蝴蝶公式只需 $$\mathcal{O}(n)$$ 的时间复杂度就可以从 $$A_0, A_1$$ 的离散傅里叶变换的结果恢复出 $$A$$ 的离散傅里叶变换的结果。综上我们给出了离散傅里叶变换 $$\mathsf{DFT}$$ 的一个 $$\mathcal{O}(n \log n)$$ 的递归算法。


### iDFT 算法 $$\mathcal{O}(n \log n)$$ 

{% plain info title="iDFT 快速离散傅里叶逆变换" %}
给定一个 $$n-1$$ 次多项式 $$A(x) = a_0 x^0 + a_1 x^1 + \dots + a_{n-1} x^{n-1}$$ 在 $$n$$ 次单位元 $$\vec w = (w_{n,0}, w_{n,1}, \ldots, w_{n,n-1})$$ 上的值 $$\left(y_0, y_1, \ldots, y_{n-1}\right)$$，其中 $$y_i = A\left(w_{n,i}\right)$$，如何在 $$\mathcal{O}(n \log n)$$  时间内计算出它的多项式的系数向量 $$\vec{A} = (a_0, a_1, \ldots, a_{n-1})$$。

{% endplain %}

简单来说，这就是多项式插值，利用拉格朗日插值算法可以在 $$\mathcal{O}(n^2)$$ 时间内完成，本质上是求解线性方程组，即

$$
\underbrace{
\begin{pmatrix}
w_n^0 & w_n^0 & w_n^0 & w_n^0 & \cdots & w_n^0 \\
w_n^0 & w_n^1 & w_n^2 & w_n^3 & \cdots & w_n^{n-1} \\
w_n^0 & w_n^2 & w_n^4 & w_n^6 & \cdots & w_n^{2(n-1)} \\
w_n^0 & w_n^3 & w_n^6 & w_n^9 & \cdots & w_n^{3(n-1)} \\
\vdots & \vdots & \vdots & \vdots & \ddots & \vdots \\
w_n^0 & w_n^{n-1} & w_n^{2(n-1)} & w_n^{3(n-1)} & \cdots & w_n^{(n-1)(n-1)}
\end{pmatrix}
}_{\mathbf{V} \in \mathbb{C}^{n \times n}}
\begin{pmatrix}
a_0 \\ a_1 \\ a_2 \\ a_3 \\ \vdots \\ a_{n-1}
\end{pmatrix} = \begin{pmatrix}
y_0 \\ y_1 \\ y_2 \\ y_3 \\ \vdots \\ y_{n-1}
\end{pmatrix}
$$

其中 $$\mathbf{V} \in \mathbb{C}^{n \times n}$$ 就是范德蒙矩阵。这个矩阵的逆为：

$$
\mathbf{V}^{-1} = 
\frac{1}{n}
\begin{pmatrix}
w_n^0 & w_n^0 & w_n^0 & w_n^0 & \cdots & w_n^0 \\
w_n^0 & w_n^{-1} & w_n^{-2} & w_n^{-3} & \cdots & w_n^{-(n-1)} \\
w_n^0 & w_n^{-2} & w_n^{-4} & w_n^{-6} & \cdots & w_n^{-2(n-1)} \\
w_n^0 & w_n^{-3} & w_n^{-6} & w_n^{-9} & \cdots & w_n^{-3(n-1)} \\
\vdots & \vdots & \vdots & \vdots & \ddots & \vdots \\
w_n^0 & w_n^{-(n-1)} & w_n^{-2(n-1)} & w_n^{-3(n-1)} & \cdots & w_n^{-(n-1)(n-1)}
\end{pmatrix} 
\\
\implies \begin{pmatrix}
a_0 \\ a_1 \\ a_2 \\ a_3 \\ \vdots \\ a_{n-1}
\end{pmatrix} = 
\mathbf{V}^{-1} 
\begin{pmatrix}
y_0 \\ y_1 \\ y_2 \\ y_3 \\ \vdots \\ y_{n-1}
\end{pmatrix}
$$

因此，该形式下的拉格朗日插值公式也非常之优雅，我们同样可以直接以多项式的形式直接给出 $$a_{k}$$ 的表达式。

$$
a_k = \frac{1}{n} \sum_{j=0}^{n-1} y_j w_n^{-k j}
$$

这就得到了一个几乎与 $$\mathsf{DFT}$$ 表达式 $$y_k = \sum_{j=0}^{n-1} a_j w_n^{k j}$$  一模一样的问题，关键变化在于：

$$
\begin{cases}
1  &\implies \frac{1}{n} \\
w_n^{k j} &\implies w_n^{-k j}
\end{cases}
$$

上节递归算法同样适用于此情形。综上我们给出了离散傅里叶逆变换 $$\textsf{iDFT}$$ 的一个 $$\mathcal{O}(n \log n)$$ 的递归算法。


> **FFT 加速的核心**: 快速傅里叶变换加速的根本在于单位元的周期性：
>
> $$
> w_{n}^{n} = 1, \quad w_{n}^{\frac{n}{2}} = -1 
> $$
>
> 从而可以复用很多运算，这样是而递归加速的本质。在之后 NTT 的讨论中，我们将进一步展开如何通过单位元的周期性去复用运算。


## 快速数论变换

密码学上，我们通常关注整数环上的多项式，更具体地，我们关注整数商环 $$\mathbb{Z}_{q}$$ 上的多项式，其中大部分情况下，我们认为 $$q$$  是一个素数。这一节，我们将所有的乘法运算都使用卷积来说明，即下面的对应关系。

| 线性卷积（Linear Convolution） | 正循环卷积（Cyclic Convolution）           | 负循环卷积 (Negacyclic Convolution)        |
| ------------------------------ | ------------------------------------------ | ------------------------------------------ |
| $$\mathbb{Z}_q[x]$$ 上的乘法运算 | $$\mathbb{Z}_q[x] / (x^n - 1)$$ 上的乘法运算 | $$\mathbb{Z}_q[x] / (x^n + 1)$$ 上的乘法运算 |


在整数商环上，我们需要找到和离散傅里叶变换中 $$e^{\frac{2\pi i}{n}}$$ 拥有相同性质的单位元，即下面定义的 $$\mathbb{Z}_{q}$$  上的本原单位元。


{% definition title="n 次本原单位元" %}
 我们称 $$w$$ 为  $$\mathbb{Z}_{q}$$  上的 n 次本原单位元，当且仅当其满足下面的性质：

$$
w^n \equiv 1 \bmod q, \text{ and } w^i \not\equiv 1 \bmod q, \forall i \in [1, n-1]
$$

{% enddefinition %}

### 线性/正循环卷积

{% definition title="数论变换 NTT" %}
 记 $$\omega$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$n$$ 次本原单位根，$$A(x)$$ 是 $$\mathbb{Z}_q[x]$$ 上 $$n-1$$ 次多项式，其系数向量 $$\mathbf{a}$$ 的**数论变换 (NTT)** 定义为 $$\hat{\mathbf{a}} = \textsf{NTT}^{\omega}(\mathbf{a})$$：

$$
\hat{\mathbf{a}}_j = \sum_{i=0}^{n-1} \omega^{ij} \mathbf{a}_i \pmod q, \quad j = 0, 1, 2, \dots, n-1
$$

特别地，我们知道 $$\hat{\mathbf{a}}_j = A(\omega^j) \pmod{ q }$$。


{% enddefinition %}

{% definition title="逆数论变换 iNTT" %}
 记 $$\omega$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$n$$ 次本原单位根，一组 $$n$$ 维点值向量 $$\hat{\mathbf{a}}$$ 的**逆数论变换 (iNTT)** 定义为 $$\mathbf{a} = \textsf{iNTT}^{\omega}(\hat{\mathbf{a}})$$：

$$
\mathbf{a}_j = \frac{1}{n} \sum_{i=0}^{n-1} \omega^{-ij} \hat{\mathbf{a}}_i \pmod q, \quad j = 0, 1, 2, \dots, n-1
$$

{% enddefinition %}

容易验证（证明上述两个表达式关于 $$\hat{\mathbf{a}}$$  和 $${\mathbf{a}}$$ 的两个矩阵互为逆）：

$$
\mathbf{a} = \textsf{iNTT}^{\omega}\left(\textsf{NTT}^{\omega}\left(\mathbf{a}\right)\right)
$$

从而我们知道线性卷积可以基于 NTT 进行如下计算。需要注意的是，如果计算 $$\mathbb{Z}_q[x]$$ 上的线性卷积，应选择变换长度 $$m \ge 2n-1$$ 并对输入进行零填充：

$$
\mathbf{c} = \mathbf{a} * \mathbf{b} = \textsf{iNTT}^{\omega}\left(\textsf{NTT}^{\omega}\left(\mathbf{a}\right) \circ \textsf{NTT}^{\omega}\left(\mathbf{b}\right)\right)
$$

同时基于快速傅里叶的优化技术可以完全迁移到 NTT 和 iNTT 上。前面我们提到过，如果想要计算  $$\mathbb{Z}_q[x]$$ 上的线性卷积， $$\mathbf{c}$$ 的维度应该是 $$2n - 1$$，而**如果我们只使用 $$n$$ 次本原单位根和长度为 $$n$$ 的变换，那么我们不会得到线性卷积，而是循环卷积。**这个时候，我们切换到多项式的角度思考，我们卷积后得到的点值其实仍然是真实的 $$A(\omega^i) \cdot B(\omega^i) \bmod q$$ 的值，但是 $$\ge n$$ 次的单项式系数相当于都被我们循环累加到低次的系数了，但是由于我们使用的是 $$n$$ 次本原根，它满足 $$x^{n + k} = x^k$$，这等价于：

$$
x^{n+k} \equiv x^k \pmod {x^{n} - 1}
$$

即我们会把结果模多项式 $${x^{n} - 1}$$，对应到系数就是真实的高次单项式系数都循环累加到低次单项式的系数上了，也就是正循环卷积的表达式：

$$
y_k = \sum_{i=0}^{k} g_i \cdot h_{k-i} + \sum_{i=k + 1}^{n-1} g_i \cdot h_{k + n - i}
$$

记 $$\textsf{NTT}_{n}^{\omega}(\cdot)$$ 为使用本原生成元 $$\omega$$ 对 $$n$$ 维向量作用的数论变换，除非特别说明，我们省略 $$n$$ 参数，认为它与实际作用的向量维度一致，默认记为 $$\textsf{NTT}^{\omega}(\cdot)$$。于是我们得到了下面的命题。


{% proposition title="NTT-based Positive Wrapped Convolution" %}
 记 $$\mathbb{Z}_q$$ 上的两个 $$n$$ 维向量为 $$\mathbf{a}, \mathbf{b}$$ （分别是对应两个 $$n-1$$ 次的多项式），以及 $$\omega$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$n$$ 次本原单位根，则它们的正循环卷积可以通过下面的数论变换计算得到：

$$
\mathbf{c} = \mathbf{a} \circledast \mathbf{b} = \textsf{iNTT}^{\omega}\left(\textsf{NTT}^{\omega}\left(\mathbf{a}\right) \circ \textsf{NTT}^{\omega}\left(\mathbf{b}\right)\right)
$$

{% endproposition %}

其实更本质的意义在于，NTT 选取的 $$n$$ 次本原单位根均满足：

$$
x^n = 1 \iff x^n - 1= 0
$$

因此，最后的结果显然就是等价于在模了多项式 $$x^n - 1$$ 之后的结果，这样对 PWC 的理解更为直观，也更利于我们去理解下一节的 NWC 背后的数学直觉。


### 负循环卷积

接下来我们考虑如何计算负循环卷积，根据表达式：

$$
y_k = \sum_{i=0}^{k} g_i \cdot h_{k-i} - \sum_{i=k + 1}^{n-1} g_i \cdot h_{k + n - i}
$$

我们很自然想到，对于 $$\ge n$$ 次的单项式系数也同样累加作用到对应的低次项了（次数模 $$n$$ 后），只不过此时对系数的贡献是负的，于是我们很自然想到此时应该有关系 $$x^{n + k} = -x^{k}$$，即此时 NTT 的本原单位根 $$\varphi$$ 应该满足 $$\varphi^{n} = - 1$$，即 $$\varphi$$ 就是 $$2n$$ 次的本原单位根。但是很显然，如果我们简单地将正循环卷积中的 $$\omega$$ 替换为 $$\varphi$$，这并不能直接得到负循环卷积，而会产生**频率偏移**或**数学意义上的不匹配**。另外标准 NTT 的旋转因子（Twiddle Factors）演变规律是基于 $$x^n = 1$$ 的本原根序列 $$\omega^0, \omega^1, \omega^2, \ldots, \omega^{n-1}$$，而简单替换为 $$\varphi^0, \varphi^1, \varphi^2, \ldots, \varphi^{n-1}$$，这样一半的 $$2n$$ 次本原单位根不具有 $$x^n = 1$$ 或者 $$x^n = -1$$ 一致的恒等式，而这种性质是快速 NTT 的关键。这里我给出两个 NWC 构造的数学上的理解。


记  $$\varphi$$ 是 $$2n$$ 次的本原单位根，$$\omega$$ 是 $$n$$ 次的本原单位根，并且满足 $$\omega = \varphi^2$$。

{% plain error title="NWC 构造理解方式 1" %}

从序列上看，我们需要就是满足 $$x^n = -1$$ 的所有根，这恰好也有 $$n$$ 个，并且读者可以验证这 $$n$$ 个根恰好就是下面的序列：

$$
\{\varphi^1, \varphi^3, \varphi^5, \ldots, \varphi^{2n-1}\}
$$

也就是说，$$x^n+1$$ 的根恰好是 $$2n$$ 次单位根中的奇数次幂。因此基于 $$\varphi$$ 的 NTT 构造如下：

$$
\hat{\mathbf{a}}_j = \sum_{i=0}^{n-1} \varphi^{i(2j+1)} a_i \pmod q, \quad j = 0, 1, 2, \dots, n-1
$$

{% endplain %}

{% plain error title="NWC 构造理解方式 2" %}

现在我们的想法是将 NWC 转换为 PWC，于是我们就可以使用前面定义的标准的 NTT 来计算，为了达到这个效果，我们需要对系数进行变换。即定义新的多项式 $$\hat{A}(y)$$，令 $$x = \varphi \cdot y$$。 当 $$x^n = -1$$ 时，$$(\varphi y)^n = -1 \Rightarrow \varphi^n y^n = -1$$。 因为 $$\varphi^n = -1$$，所以该式变为 $$-y^n = -1 \Rightarrow y^n = 1$$。因此如果对 $$\hat{A}(y)$$ 进行正循环卷积的 NTT 变换，就得到了对原多项式的负卷积 NTT 变换。

对应到系数的映射，就是 $$\mathbf{a}'_i = \mathbf{a}_i \cdot \varphi^i$$，构造多项式 $$A'(x) = \sum \mathbf{a}'_i x^i$$，对此进行正循环卷积的 NTT 变换：

$$
\begin{aligned}
\hat{\mathbf{a}}_j &= \sum_{i=0}^{n-1} \omega^{ij} \mathbf{a}'_i \pmod q \\
&= \sum_{i=0}^{n-1}  \omega^{ij} \varphi^i \mathbf{a}_i \pmod q \\
&= \sum_{i=0}^{n-1} \varphi^{i(2j + 1)} \mathbf{a}_i \pmod q
\end{aligned}
$$

其中 $$j = 0, 1, 2, \dots, n-1$$。


{% endplain %}

上面两种方式得到的结果是一致的，我们得到了负循环数论变换的正式定义如下。


{% definition title="负循环数论变换" %}
 记 $$\varphi$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$2n$$ 次本原单位根，则 $$\omega := \varphi^2$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$n$$ 次本原单位根， $$A(x)$$ 是 $$\mathbb{Z}_q[x]$$ 上 $$n-1$$ 次多项式，其系数向量 $$\mathbf{a}$$ 基于 $$\varphi$$ 的数论变换定义为 $$\hat{\mathbf{a}} = \textsf{NTT}^{\varphi}(\mathbf{a})$$：

$$
\hat{\mathbf{a}}_j = \sum_{i=0}^{n-1} \varphi^i \omega^{ij} \mathbf{a}_i \pmod q, \quad j = 0, 1, 2, \dots, n-1
$$

代入 $$\omega := \varphi^2$$，这等价于：

$$
\hat{\mathbf{a}}_j = \sum_{i=0}^{n-1} \varphi^{i(2j + 1)} \mathbf{a}_i \pmod q
$$

{% enddefinition %}

> 同理我们对范德蒙矩阵求逆，可以得到负循环逆数论变换的公式，值的指出的是，<https://eprint.iacr.org/2024/585.pdf> 这篇论文对 iNTT 的定义存在重大 typo。

{% definition title="负循环逆数论变换" %}
 记 $$\varphi$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$2n$$ 次本原单位根，令 $$\omega := \varphi^2$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$n$$ 次本原单位根，一组 $$n$$ 维点值向量 $$\hat{\mathbf{a}}$$ 的基于 $$\varphi$$ 的逆数论变换定义为 $$\mathbf{a} = \textsf{iNTT}^\varphi(\hat{\mathbf{a}})$$：

$$
\mathbf{a}_j = \frac{1}{n} \sum_{i=0}^{n-1} \varphi^{-j} \omega^{-ij} \hat{\mathbf{a}}_i \pmod q, \quad j = 0, 1, 2, \dots, n-1
$$

代入 $$\omega := \varphi^2$$，这等价于：

$$
\mathbf{a}_j = \frac{1}{n} \sum_{i=0}^{n-1} \varphi^{-j(2i + 1)} \hat{\mathbf{a}}_i \pmod q
$$

{% enddefinition %}

容易验证（证明上述两个表达式关于 $$\hat{\mathbf{a}}$$  和 $${\mathbf{a}}$$ 的两个矩阵互为逆）：

$$
\mathbf{a} = \textsf{iNTT}^\varphi \left(\textsf{NTT}^\varphi\left(\mathbf{a}\right)\right)
$$

{% proposition title="NTT-based Negative Wrapped Convolution" %}
 记 $$\mathbb{Z}_q$$ 上的两个 $$n$$ 维向量为 $$\mathbf{a}, \mathbf{b}$$ （分别是对应两个 $$n-1$$ 次的多项式），以及 $$\varphi$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$2n$$ 次本原单位根，则它们的负循环卷积可以通过下面的数论变换计算得到：

$$
\mathbf{c} = \mathbf{a} \star \mathbf{b} = \textsf{iNTT}^{\varphi}\left(\textsf{NTT}^{\varphi}\left(\mathbf{a}\right) \circ \textsf{NTT}^{\varphi}\left(\mathbf{b}\right)\right)
$$

{% endproposition %}

### 数论变换的本质

回到代数的视角，数论变换的本质就是环的分解与同构，我们以 NWC 卷积为例。$$\varphi$$  是一个 $$\mathbb{Z}_q$$ 上的 $$2n$$ 次本原单位根，则分圆多项式（cyclotomic polynomial）$$C(X) = X^{n} + 1$$ 存在下面的分解：

$$
C(X) = \prod_{i=0}^{n-1} (X - \varphi^{2i + 1})
$$

由中国剩余定理，我们知道存在下面的环同构：

$$
\mathbb{Z}_q[X] / (X^n + 1) \cong \prod_{i=0}^{n-1} \mathbb{Z}_q[X] / (X - \varphi^{2i + 1})
$$

由于对于每一个因子 $$\alpha = \varphi^{2i + 1}$$，都有 $$\mathbb{Z}_q[X] / (X - \alpha) \cong \mathbb{Z}_q$$（通过映射 $$X \mapsto \alpha$$ 实现，即多项式在点 $$\alpha$$ 的取值），上述同构可以进一步简化为：

$$
\mathbb{Z}_q[X] / (X^n + 1) \cong \underbrace{\mathbb{Z}_q \times \mathbb{Z}_q \times \dots \times \mathbb{Z}_q}_{n} \cong \mathbb{Z}_q^n
$$

对于多项式 $$A(X) \in \mathbb{Z}_q[X] / (X^n + 1)$$，其系数向量 $$\mathbf{a}$$  的数论变换 NTT 和逆数论变换 iNTT 的本质就是一个环同构。

$$
\begin{aligned}
\textsf{NTT}: 
\mathbb{Z}_q[X] / (X^n + 1) \mapsto \mathbb{Z}_q^{n} &\implies
\mathbf{a} \mapsto (A(\varphi^{1}), A(\varphi^{3}), \dots, A(\varphi^{2n-1}))\\
\textsf{iNTT}: 
\mathbb{Z}_q^{n} \mapsto \mathbb{Z}_q[X] / (X^n + 1) &\implies
(A(\varphi^{1}), A(\varphi^{3}), \dots, A(\varphi^{2n-1})) \mapsto \mathbf{a} \\
\end{aligned}
$$

而快速傅里叶/数论变换的本质在于上面的群同构又同时存在下面的可递归分治的分解：

$$
\begin{aligned}
\mathbb{Z}_q[X] / (X^n + 1) & \cong  \mathbb{Z}_q[X] / (X^{\frac{n}{2}} - \varphi^{\frac{n}{2}}) \times  \mathbb{Z}_q[X] / (X^{\frac{n}{2}} + \varphi^{\frac{n}{2}})  \\
&\cong  \mathbb{Z}_q[X] / (X^{\frac{n}{4}} - \varphi^{\frac{n}{4}}) \times \mathbb{Z}_q[X] / (X^{\frac{n}{4}} + \varphi^{\frac{n}{4}}) \\

&\quad \times \mathbb{Z}_q[X] / (X^{\frac{n}{4}} - \varphi^{\frac{3n}{4}}) \times \mathbb{Z}_q[X] / (X^{\frac{n}{4}} + \varphi^{\frac{3n}{4}}) \\
& \cong \cdots \\
& \cong \prod_{i=0}^{n-1} \mathbb{Z}_q[X] / (X - \varphi^{2i + 1})
\end{aligned}
$$

即下面的 CRT 同构映射：

{% include figure.html src="/assets/images/260429-fast-fourier-transform/nwc-crt-decomposition.png" alt="NWC 的 CRT 分解示意图" width="85%" caption="图 1 NWC 场景下的 CRT 递归分解，图源自 https://arxiv.org/pdf/2211.13546" %}


同理对于 PWC 卷积，其模多项式 $$x^n - 1$$ 也存在类似的 CRT 同构映射：

{% include figure.html src="/assets/images/260429-fast-fourier-transform/pwc-crt-decomposition.png" alt="PWC 的 CRT 分解示意图" width="85%" caption="图 2 PWC 场景下的 CRT 递归分解，图源自 https://arxiv.org/pdf/2211.13546" %}


从上面的环同构的分解，我们就大概可以看出蝴蝶操作的雏形了。下一节，我们将介绍快速数论变换的蝴蝶操作（ Cooley-Tukey 算法）与快速逆数论变换的蝴蝶操作（Gentleman-Sande 算法）。


## CT/GS 蝴蝶算法

记 $$\varphi$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$2n$$ 次本原单位根， $$\omega := \varphi^2$$ 是一个 $$\mathbb{Z}_q$$ 上的 $$n$$ 次本原单位根，其中 $$n$$ 恰好是 2 的次幂，从而保证可以完整递归。

快速傅里叶最关键的性质在于：

$$
\varphi^{k+2n} = \varphi^{k} \\
\varphi^{k+n} = -\varphi^{k}
$$

为了统一表达形式，我们记正循环卷积的数论变换为 $$\textsf{NTT}^{+}$$，负循环卷积的数论变换为 $$\textsf{NTT}^{-}$$，由于  $$\omega := \varphi^2$$，它们可以统一表示为 $$\varphi$$ 的形式

$$
\begin{cases}
\textsf{NTT}^{+}: & \hat{\mathbf{a}}_j = \sum_{i=0}^{n-1} \varphi^{i \cdot 2j} \mathbf{a}_i \pmod q, & j = 0, 1, 2, \dots, n-1 \\
\textsf{NTT}^{-}: & \hat{\mathbf{a}}_j = \sum_{i=0}^{n-1} \varphi^{i \cdot (2j + 1)} \mathbf{a}_i \pmod q, & j = 0, 1, 2, \dots, n-1 \\
\end{cases}
$$

我们接下来只考虑负循环卷积的情形即可，因为通过系数重构 $$\mathbf{b}_i :=\varphi^{-i} \cdot \mathbf{a}_i$$，很容易得到对应的正循环卷积变换。


### Fast-NTT:  Cooley-Tukey Algorithm

考虑下面的第一步环同构：

$$
\begin{aligned}
\hat{\boldsymbol{a}}_j & =\sum_{i=0}^{n-1} \varphi^{2 i j+i} a_i \bmod q \\
& = \left[ \sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i}+\sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 j+2 i+1} a_{2 i+1}  \right] \bmod q \\
& = \left[
\sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i}+\varphi^{2 j+1} \sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i+1} 
\right]\bmod q
\end{aligned}
$$

考虑 $$J = j + n/2 > n/2$$ 的系数：

$$
\hat{\boldsymbol{a}}_{J} = \hat{\boldsymbol{a}}_{j+n / 2}=\sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i}-\varphi^{2 j+1} \sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i+1} \quad \bmod q, j \in [0,n/2 - 1]
$$

这实际上给出了一些可重复计算的系数，令 $$A_j=\sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i}$$ 以及 $$B_j=\sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i+1}$$，则根据分解可以得到：

$$
\begin{cases}
\text{Former}: & \hat{\boldsymbol{a}}_j & =A_j+\varphi^{2 j+1} B_j \quad \bmod q \\
\text{Latter}: &\hat{\boldsymbol{a}}_{j+n / 2} & =A_j-\varphi^{2 j+1} B_j \quad \bmod q
\end{cases}
$$

其中 $$A_j, B_j$$ 的系数又可以通过 $$n/2$$ 个点的 NTT 变换计算得到。定义：

$$
\begin{cases}
\mathbf{a}^{(0)} = (a_0, a_2, \ldots, a_{n-2}) \\
\mathbf{a}^{(1)} = (a_1, a_3, \ldots, a_{n-1})
\end{cases}
$$

则令 $$\omega = \varphi^2$$ 是一个 $$2 \cdot \left( \frac{n}{2} \right)$$  次本原根，我们知道

$$
\begin{cases}
\mathbf{A} = \textsf{NTT}_{n/2}^{\omega}(\mathbf{a}^{(0)}), & A_j=\sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i} = \sum_{i=0}^{n / 2-1} \omega^{2ij+i} a_{2 i} \\
\mathbf{B} = \textsf{NTT}_{n/2}^{\omega}(\mathbf{a}^{(1)}), & B_j=\sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i + 1} = \sum_{i=0}^{n / 2-1} \omega^{2ij+i} a_{2 i + 1}

\end{cases}
$$

如此递归直到我们可以以常数时间内计算出 NTT 变换的系数。

{% plain success title="递归 Cooley-Tukey NTT" %}

$$
\begin{array}{l}
\textsf{CT-NTT}^{\varphi}(\mathbf{a}): \\
\quad n \leftarrow \vert\mathbf{a}\vert \\
\quad \text{if } n=1,\ \text{return } \mathbf{a} \\
\quad \mathbf{a}^{(0)} \leftarrow (a_0,a_2,\ldots,a_{n-2}) \\
\quad \mathbf{a}^{(1)} \leftarrow (a_1,a_3,\ldots,a_{n-1}) \\
\quad \mathbf{A} \leftarrow \textsf{CT-NTT}^{\varphi^2}(\mathbf{a}^{(0)}) \\
\quad \mathbf{B} \leftarrow \textsf{CT-NTT}^{\varphi^2}(\mathbf{a}^{(1)}) \\
\quad \text{for } j=0,\ldots,n/2-1: \\
\quad\quad \hat{\mathbf{a}}_j \leftarrow A_j+\varphi^{2j+1}B_j \pmod q \\
\quad\quad \hat{\mathbf{a}}_{j+n/2} \leftarrow A_j-\varphi^{2j+1}B_j \pmod q \\
\quad \text{return } \hat{\mathbf{a}}
\end{array}
$$

{% endplain %}

> 对于正循环卷积的标准 NTT，递归结构相同，只需要把上面的 $$\varphi^{2j+1}$$ 替换为 $$\omega^j$$，并将子问题根替换为 $$\omega^2$$。


### Fast-iNTT: Gentleman-Sande Algorithm

回顾逆 NTT 的计算如下：

$$
\begin{aligned}
\mathbf{a}_j &= \frac{1}{n} \cdot \varphi^{-j} \sum_{i=0}^{n-1} \varphi^{-(2ij)} \hat{\mathbf{a}}_i \bmod q  \\
& = \frac{1}{n} \sum_{i=0}^{n-1} \varphi^{-j(2i + 1)} \hat{\mathbf{a}}_i \pmod q
\\
\end{aligned}
$$

逆 NTT 的快速计算，其分解方式如下：

$$
\begin{aligned}
\mathbf{a}_j 
& = \frac{1}{n} \sum_{i=0}^{n-1} \varphi^{-j (2i + 1)} \hat{\mathbf{a}}_i  \bmod q \\
& = 
\frac{1}{n} \cdot \varphi^{-j}
\left[ \sum_{i=0}^{n / 2-1} \varphi^{-2ij} \hat{\mathbf{a}}_i +\sum_{i=n/2}^{n - 1} \varphi^{-2ij} \hat{\mathbf{a}}_i  \right] \bmod q \\
& = 
\frac{1}{n} \cdot \varphi^{-j}
\left[ \sum_{i=0}^{n / 2-1} \varphi^{-2ij} \hat{\mathbf{a}}_i +\sum_{i=0}^{n/2 - 1} \varphi^{-2(i + n/2)j} \hat{\mathbf{a}}_{i + n/2} \right] \bmod q \\
& = 
\frac{1}{n} \cdot \varphi^{-j}
\left[ \sum_{i=0}^{n / 2-1} \varphi^{-2ij} \hat{\mathbf{a}}_{i} + (-1)^j \sum_{i=0}^{n/2 - 1} \varphi^{-2ij} \hat{\mathbf{a}}_{i + n/2} \right] \bmod q \\
& = 
\frac{1}{n} \cdot \varphi^{-j}
\left[ \sum_{i=0}^{n / 2-1} \varphi^{-2ij} \left( \hat{\mathbf{a}}_{i} + (-1)^j  \hat{\mathbf{a}}_{i + n/2} \right) \right] \bmod q \\
\end{aligned}
$$

奇偶系数可以差分如下：

$$
\begin{cases}
\mathbf{a}_{2k}  & = 
\frac{1}{n} \cdot \varphi^{-2k} 
\left[ 
\sum_{i=0}^{n / 2-1} \left( \varphi^{-4ki} \left( \hat{\mathbf{a}}_{i}+ \hat{\mathbf{a}}_{i + n/2} \right) \right) \right] \bmod q \\
\mathbf{a}_{2k+1} & = 
\frac{1}{n} \cdot \varphi^{-2k - 1} 
\left[ 
\sum_{i=0}^{n / 2-1} \left( \varphi^{-2i(2k + 1)} \left( \hat{\mathbf{a}}_{i} - \hat{\mathbf{a}}_{i + n/2} \right) \right) \right] \bmod q \\

\end{cases}
$$

接下来我们从两个角度分析递归公式的推导。


#### 反解 CT 变换

Gentleman-Sande 逆变换可以直接反解上一节 Cooley-Tukey 正变换中的蝴蝶公式。回忆负循环卷积场景下的 CT 正变换。将输入系数按奇偶下标拆成：

$$
\begin{cases}
\mathbf{a}^{(0)} = (a_0, a_2, \ldots, a_{n-2}) \\
\mathbf{a}^{(1)} = (a_1, a_3, \ldots, a_{n-1})
\end{cases}
$$

令 $$\omega = \varphi^2$$，则 $$\omega$$ 是长度为 $$n/2$$ 的负循环子问题所需的 $$n$$ 次本原单位根，即它在子问题中扮演 $$2\cdot(n/2)$$ 次本原单位根的角色。记：

$$
\begin{cases}
\mathbf{E} = \textsf{NTT}_{n/2}^{\omega}(\mathbf{a}^{(0)}), & E_j=\sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i} = \sum_{i=0}^{n / 2-1} \omega^{2 i j+i} a_{2 i}  \\
\mathbf{O} = \textsf{NTT}_{n/2}^{\omega}(\mathbf{a}^{(1)}), & O_j=\sum_{i=0}^{n / 2-1} \varphi^{4 i j+2 i} a_{2 i+1} = \sum_{i=0}^{n / 2-1} \omega^{2 i j+i} a_{2 i+1}
\end{cases}
$$

则 CT 蝴蝶给出：

$$
\begin{cases}
\hat{\mathbf{a}}_j = E_j + \varphi^{2j+1} O_j, & j = 0, \ldots, \frac{n}{2}-1 \\
\hat{\mathbf{a}}_{j+n/2} = E_j - \varphi^{2j+1} O_j, & j = 0, \ldots, \frac{n}{2}-1
\end{cases}
$$

GS 逆变换就是对这个线性系统逐层求逆。给定当前层的点值向量 $$\hat{\mathbf{a}}$$，先将上下半区配对，恢复两个长度为 $$n/2$$ 的子问题点值向量：

$$
\begin{cases}
E_j = \frac{1}{2}\left(\hat{\mathbf{a}}_j + \hat{\mathbf{a}}_{j+n/2}\right), & j = 0, \ldots, \frac{n}{2}-1 \\
O_j = \frac{1}{2\varphi^{2j+1}}\left(\hat{\mathbf{a}}_j - \hat{\mathbf{a}}_{j+n/2}\right), & j = 0, \ldots, \frac{n}{2}-1
\end{cases}
$$

然后递归地对 $$\mathbf{E}$$ 与 $$\mathbf{O}$$ 做长度为 $$n/2$$ 的逆变换：

$$
\begin{cases}
\mathbf{a}^{(0)} = \textsf{iNTT}_{n/2}^{\omega}(\mathbf{E}) \\
\mathbf{a}^{(1)} = \textsf{iNTT}_{n/2}^{\omega}(\mathbf{O})
\end{cases}
$$

最后将两个子问题的系数交错合并：

$$
\begin{cases}
a_{2r} = a^{(0)}_r, & r = 0, \ldots, \frac{n}{2}-1 \\
a_{2r+1} = a^{(1)}_r, & r = 0, \ldots, \frac{n}{2}-1
\end{cases}
$$

递归终止条件为 $$n=1$$，此时输入点值向量本身就是系数向量。由于每一层蝴蝶都乘以 $$\frac{1}{2}$$，总共有 $$\log_2 n$$ 层，因此总缩放因子为：

$$
\left(\frac{1}{2}\right)^{\log_2 n} = \frac{1}{n}
$$

这正好对应 iNTT 定义中的归一化因子 $$\frac{1}{n}$$。因此实现时在每一层使用 $$2^{-1} \bmod q$$，而不需要在递归结束后再额外乘以 $$n^{-1}$$。


#### 标准 GS 变换推导

我们直接从 $$\textsf{iNTT}^{\varphi}$$ 的定义公式推出递归。令当前层输入点值向量为 $$\hat{\mathbf{a}}=(\hat{\mathbf{a}}_0,\ldots,\hat{\mathbf{a}}_{n-1})$$，输出系数向量为 $$\mathbf{a}=(\mathbf{a}_0,\ldots,\mathbf{a}_{n-1})$$。根据定义：

$$
\mathbf{a}_j = \frac{1}{n}\sum_{i=0}^{n-1}\varphi^{-j(2i+1)}\hat{\mathbf{a}}_i \pmod q
$$

将输出下标 $$j$$ 分成偶数与奇数两种情况。对于偶数下标 $$j=2k$$，有：

$$
\begin{aligned}
\mathbf{a}_{2k}
&= \frac{1}{n}\sum_{i=0}^{n-1}\varphi^{-2k(2i+1)}\hat{\mathbf{a}}_i \\
&= \frac{1}{n}\varphi^{-2k}\sum_{i=0}^{n-1}\varphi^{-4ki}\hat{\mathbf{a}}_i \\
&= \frac{1}{n}\varphi^{-2k}\sum_{i=0}^{n/2-1}
\left(\varphi^{-4ki}\hat{\mathbf{a}}_i+\varphi^{-4k(i+n/2)}\hat{\mathbf{a}}_{i+n/2}\right) \\
&= \frac{1}{n}\varphi^{-2k}\sum_{i=0}^{n/2-1}
\varphi^{-4ki}\left(\hat{\mathbf{a}}_i+\hat{\mathbf{a}}_{i+n/2}\right)
\end{aligned}
$$

其中最后一步使用了 $$\varphi^{-4k(i+n/2)}=\varphi^{-4ki}\varphi^{-2kn}=\varphi^{-4ki}$$。

对于奇数下标 $$j=2k+1$$，有：

$$
\begin{aligned}
\mathbf{a}_{2k+1}
&= \frac{1}{n}\sum_{i=0}^{n-1}\varphi^{-(2k+1)(2i+1)}\hat{\mathbf{a}}_i \\
&= \frac{1}{n}\varphi^{-(2k+1)}\sum_{i=0}^{n-1}\varphi^{-2(2k+1)i}\hat{\mathbf{a}}_i \\
&= \frac{1}{n}\varphi^{-(2k+1)}\sum_{i=0}^{n/2-1}
\left(\varphi^{-2(2k+1)i}\hat{\mathbf{a}}_i+\varphi^{-2(2k+1)(i+n/2)}\hat{\mathbf{a}}_{i+n/2}\right) \\
&= \frac{1}{n}\varphi^{-(2k+1)}\sum_{i=0}^{n/2-1}
\varphi^{-2(2k+1)i}\left(\hat{\mathbf{a}}_i-\hat{\mathbf{a}}_{i+n/2}\right)
\end{aligned}
$$

其中最后一步使用了 $$\varphi^{-2(2k+1)(i+n/2)}=-\varphi^{-2(2k+1)i}$$。

现在令子问题的本原单位根为 $$\omega=\varphi^2$$，并定义两个长度为 $$n/2$$ 的新点值向量：

$$
\begin{cases}
E_i = \frac{1}{2}\left(\hat{\mathbf{a}}_i+\hat{\mathbf{a}}_{i+n/2}\right), \\
O_i = \frac{1}{2}\varphi^{-(2i+1)}\left(\hat{\mathbf{a}}_i-\hat{\mathbf{a}}_{i+n/2}\right),
\end{cases}
\quad i=0,\ldots,\frac{n}{2}-1
$$

我们可以观察到上面两个长度为 $$n/2$$ 的 $$\textsf{iNTT}^{\omega}$$ 递归子问题分别给出：

$$
\begin{aligned}
\textsf{iNTT}_{n/2}^{\omega}(\mathbf{E})_k
&= \frac{2}{n}\sum_{i=0}^{n/2-1}\omega^{-k(2i+1)}E_i \\
&= \frac{1}{n}\varphi^{-2k}\sum_{i=0}^{n/2-1}
\varphi^{-4ki}\left(\hat{\mathbf{a}}_i+\hat{\mathbf{a}}_{i+n/2}\right) \\
&= \mathbf{a}_{2k},
\end{aligned}
$$

以及：

$$
\begin{aligned}
\textsf{iNTT}_{n/2}^{\omega}(\mathbf{O})_k
&= \frac{2}{n}\sum_{i=0}^{n/2-1}\omega^{-k(2i+1)}O_i \\
&= \frac{1}{n}\sum_{i=0}^{n/2-1}
\varphi^{-2k(2i+1)}\varphi^{-(2i+1)}
\left(\hat{\mathbf{a}}_i-\hat{\mathbf{a}}_{i+n/2}\right) \\
&= \frac{1}{n}\varphi^{-(2k+1)}\sum_{i=0}^{n/2-1}
\varphi^{-2(2k+1)i}\left(\hat{\mathbf{a}}_i-\hat{\mathbf{a}}_{i+n/2}\right) \\
&= \mathbf{a}_{2k+1}.
\end{aligned}
$$

因此，直接从 iNTT 公式可以得到递归关系：

$$
\begin{cases}
(\mathbf{a}_0,\mathbf{a}_2,\ldots,\mathbf{a}_{n-2}) = \textsf{iNTT}_{n/2}^{\varphi^2}(\mathbf{E}) \\
(\mathbf{a}_1,\mathbf{a}_3,\ldots,\mathbf{a}_{n-1}) = \textsf{iNTT}_{n/2}^{\varphi^2}(\mathbf{O})
\end{cases}
$$

递归的核心在于 $$\mathbf{E}$$ 和 $$\mathbf{O}$$ 的向量计算：

$$
\begin{cases}
E_i \leftarrow 2^{-1}(\hat{\mathbf{a}}_i+\hat{\mathbf{a}}_{i+n/2}) \pmod q \\
O_i \leftarrow 2^{-1}(\hat{\mathbf{a}}_i-\hat{\mathbf{a}}_{i+n/2})\cdot(\varphi^{2i+1})^{-1} \pmod q
\end{cases}
$$

{% plain success title="递归 Gentleman-Sande iNTT" %}

$$
\begin{array}{l}
\textsf{GS-iNTT}^{\varphi}(\hat{\mathbf{a}}): \\
\quad n \leftarrow \vert\hat{\mathbf{a}}\vert \\
\quad \text{if } n=1,\ \text{return } \hat{\mathbf{a}} \\
\quad \text{for } j=0,\ldots,n/2-1: \\
\quad\quad E_j \leftarrow 2^{-1}\left(\hat{\mathbf{a}}_j+\hat{\mathbf{a}}_{j+n/2}\right) \pmod q \\
\quad\quad O_j \leftarrow 2^{-1}\left(\hat{\mathbf{a}}_j-\hat{\mathbf{a}}_{j+n/2}\right)\cdot\left(\varphi^{2j+1}\right)^{-1} \pmod q \\
\quad \mathbf{a}^{(0)} \leftarrow \textsf{GS-iNTT}^{\varphi^2}(\mathbf{E}) \\
\quad \mathbf{a}^{(1)} \leftarrow \textsf{GS-iNTT}^{\varphi^2}(\mathbf{O}) \\
\quad \text{for } r=0,\ldots,n/2-1: \\
\quad\quad \mathbf{a}_{2r} \leftarrow \mathbf{a}^{(0)}_r \\
\quad\quad \mathbf{a}_{2r+1} \leftarrow \mathbf{a}^{(1)}_r \\
\quad \text{return } \mathbf{a}
\end{array}
$$

{% endplain %}

注意最后一步是把两个递归子问题的结果按偶数下标与奇数下标交错合并；递归版本这里不需要 bit-reversal，也不需要再额外乘以 $$n^{-1}$$，因为每一层的 $$2^{-1}$$ 已经累计成了逆 NTT 定义中的归一化因子 $$n^{-1}$$。

> 对于正循环卷积的 iNTT，递归结构相同，只需要把 $$\varphi^{2j+1}$$ 替换为 $$\omega^j$$，并将子问题根替换为 $$\omega^2$$：
>
>  $$
>  \begin{cases}
>  E_j = \frac{1}{2}\left(\hat{\mathbf{a}}_j + \hat{\mathbf{a}}_{j+n/2}\right) \\
>  O_j = \frac{1}{2\omega^j}\left(\hat{\mathbf{a}}_j - \hat{\mathbf{a}}_{j+n/2}\right)
>  \end{cases}
>  $$

### 蝴蝶操作的非递归迭代算法

递归版本的 CT/GS 算法最适合理解公式来源，但实际实现通常会将递归展开为迭代的蝴蝶网络。递归 CT 的本质是不断按照输入下标的奇偶性拆分子问题：第一层看最低位，第二层看次低位，直到最高位。因此，递归树最底层的输入顺序恰好是原始下标的 bit-reversal permutation（BO 序）。记 $$\operatorname{brv}_{\ell}(i)$$ 表示将 $$\ell=\log_2 n$$ 比特的整数 $$i$$ 进行二进制位反转。例如当 $$n=8$$ 时：

$$
(0,1,2,3,4,5,6,7)
\mapsto
(0,4,2,6,1,5,3,7)
$$

按照三比特展开，对应关系为：

$$
\begin{cases}
000_2 \mapsto 000_2, & 0 \mapsto 0 \\
001_2 \mapsto 100_2, & 1 \mapsto 4 \\
010_2 \mapsto 010_2, & 2 \mapsto 2 \\
011_2 \mapsto 110_2, & 3 \mapsto 6 \\
100_2 \mapsto 001_2, & 4 \mapsto 1 \\
101_2 \mapsto 101_2, & 5 \mapsto 5 \\
110_2 \mapsto 011_2, & 6 \mapsto 3 \\
111_2 \mapsto 111_2, & 7 \mapsto 7
\end{cases}
$$

以 n = 8 为例，我们以自然顺序（NO）输入的系数向量为 $$(a_0,a_1,a_2,a_3,a_4,a_5,a_6,a_7)$$，最终得到的输出系数向量不是自然序，而是 BO 序： $$(\hat a_0 \mid \hat a_4 \mid \hat a_2 \mid \hat a_6 \mid \hat a_1 \mid \hat a_5 \mid \hat a_3 \mid \hat a_7)$$，详细的 CT 操作过程中的置乱如下：

$$
\begin{aligned}
&\textbf{Cooley-Tukey：} \text{NO} \to \text{BO}  \\[2mm]
&(a_0,a_1,a_2,a_3,a_4,a_5,a_6,a_7)
\\
&\xrightarrow{\text{split by bit }0}
(a_0,a_2,a_4,a_6 \mid a_1,a_3,a_5,a_7)
\\
&\xrightarrow{\text{split by bit }1}
(a_0,a_4 \mid a_2,a_6 \mid a_1,a_5 \mid a_3,a_7)
\\
&\xrightarrow{\text{split by bit }2}
(a_0 \mid a_4 \mid a_2 \mid a_6 \mid a_1 \mid a_5 \mid a_3 \mid a_7)
\\
&\qquad =
(\hat{a}_{\operatorname{brv}_3(0)},\hat{a}_{\operatorname{brv}_3(1)},\dots,\hat{a}_{\operatorname{brv}_3(7)})
\end{aligned}
$$

这正是 CT 递归到最底层之后叶子节点从左到右的顺序，整个置乱的阶为 2，再做一次相同的置乱即可从 BO 序列翻转到正常的 NO 序列。事实上

1. 如果输入是 BO 序列，CT 蝴蝶操作后得到 NO 序列。
2. 如果输入是 NO 序列，CT 蝴蝶操作后得到 BO 序列。

再回到 Gentleman-Sande 蝴蝶操作，从结果上看二者的置乱是完全相同的。总之，如果我们想要得到正常的 NO 序列，最后需要将结果向量从 BO 序列置乱回来。顺序分析清楚之后，我们继续分析迭代形式的 Fast NTT 算法


#### 非递归 Cooley-Tukey NTT

对于正循环卷积的标准 NTT，令 $$\omega$$ 是 $$n$$ 次本原单位根。CT 迭代算法先将输入系数向量按 bit-reversal 顺序重排，然后从长度 $$m=2$$ 的小块开始合并，逐层翻倍直到 $$m=n$$。在每个长度为 $$m$$ 的块内，局部本原 $$m$$ 次单位根为：

$$
\omega_m = \omega^{n/m}
$$

对于块内位置 $$j=0,\ldots,m/2-1$$，CT 蝴蝶为：

$$
\begin{cases}
u = a_{\text{start}+j} \\
v = \omega_m^j \cdot a_{\text{start}+j+m/2}
\end{cases}
\implies
\begin{cases}
a_{\text{start}+j} \leftarrow u+v \pmod q \\
a_{\text{start}+j+m/2} \leftarrow u-v \pmod q
\end{cases}
$$

{% plain warning title="迭代 Cooley-Tukey NTT" %}

$$
\begin{array}{l}
\textsf{Iter-CT-NTT}^{\omega}(\mathbf{a}): \\
\quad \mathbf{a} \leftarrow (a_{\operatorname{brv}_{\ell}(0)},a_{\operatorname{brv}_{\ell}(1)},\ldots,a_{\operatorname{brv}_{\ell}(n-1)}) \\
\quad \text{for } m=2,4,8,\ldots,n: \\
\quad\quad \omega_m \leftarrow \omega^{n/m} \\
\quad\quad \text{for } \text{start}=0,m,2m,\ldots,n-m: \\
\quad\quad\quad \text{for } j=0,\ldots,m/2-1: \\
\quad\quad\quad\quad u \leftarrow a_{\text{start}+j} \\
\quad\quad\quad\quad v \leftarrow \omega_m^j a_{\text{start}+j+m/2} \\
\quad\quad\quad\quad a_{\text{start}+j} \leftarrow u+v \pmod q \\
\quad\quad\quad\quad a_{\text{start}+j+m/2} \leftarrow u-v \pmod q \\
\quad \text{return } \mathbf{a}
\end{array}
$$

{% endplain %}

对于负循环卷积的 $$\textsf{NTT}^{\varphi}$$，令 $$\varphi$$ 是 $$2n$$ 次本原单位根。在长度为 $$m$$ 的局部子问题中，对应的 $$2m$$ 次本原单位根为：

$$
\varphi_m = \varphi^{n/m}
$$

负循环版本的 CT 蝴蝶只需要把标准 NTT 的旋转因子 $$\omega_m^j$$ 替换为奇数次幂：

$$
\varphi_m^{2j+1}
$$

即：

$$
\begin{cases}
u = a_{\text{start}+j} \\
v = \varphi_m^{2j+1} \cdot a_{\text{start}+j+m/2}
\end{cases}
\implies
\begin{cases}
a_{\text{start}+j} \leftarrow u+v \pmod q \\
a_{\text{start}+j+m/2} \leftarrow u-v \pmod q
\end{cases}
$$

#### 非递归 Gentleman-Sande iNTT

GS 逆变换可以看作 CT 蝴蝶网络的反向执行。CT 从小块合并到大块，因此 GS 从大块拆分到小块。对于标准正循环卷积的 iNTT，在长度为 $$m$$ 的块内令：

$$
\omega_m = \omega^{n/m}
$$

GS 蝴蝶为：

$$
\begin{cases}
u = a_{\text{start}+j} \\
v = a_{\text{start}+j+m/2}
\end{cases}
\implies
\begin{cases}
a_{\text{start}+j} \leftarrow \frac{u+v}{2} \pmod q \\
a_{\text{start}+j+m/2} \leftarrow \frac{u-v}{2\omega_m^j} \pmod q
\end{cases}
$$

这里把 $$\frac{1}{2}$$ 放在每一层蝴蝶中；因为共有 $$\log_2 n$$ 层，整体缩放为 $$1/n$$。另一种常见写法是每层不乘 $$\frac{1}{2}$$，最后统一乘 $$n^{-1}$$，二者等价。当前代码采用前一种写法，因此不需要在最后额外乘以 $$n^{-1}$$。GS 每一层执行后，数据仍然保持递归拆分的分组顺序；全部层执行完后得到的是 bit-reversal 顺序的系数，因此最后需要再做一次 bit-reversal 才能返回自然顺序。


{% plain warning title="迭代 Gentleman-Sande iNTT" %}
$$
\begin{array}{l}
\textsf{Iter-GS-iNTT}^{\omega}(\hat{\mathbf{a}}): \\
\quad \mathbf{a} \leftarrow \hat{\mathbf{a}} \\
\quad \text{for } m=n,n/2,n/4,\ldots,2: \\
\quad\quad \omega_m \leftarrow \omega^{n/m} \\
\quad\quad \text{for } \text{start}=0,m,2m,\ldots,n-m: \\
\quad\quad\quad \text{for } j=0,\ldots,m/2-1: \\
\quad\quad\quad\quad u \leftarrow a_{\text{start}+j} \\
\quad\quad\quad\quad v \leftarrow a_{\text{start}+j+m/2} \\
\quad\quad\quad\quad a_{\text{start}+j} \leftarrow 2^{-1}(u+v) \pmod q \\
\quad\quad\quad\quad a_{\text{start}+j+m/2} \leftarrow 2^{-1}(u-v)(\omega_m^j)^{-1} \pmod q \\
\quad \text{return } (a_{\operatorname{brv}_{\ell}(0)},a_{\operatorname{brv}_{\ell}(1)},\ldots,a_{\operatorname{brv}_{\ell}(n-1)})
\end{array}
$$
{% endplain %}


对于负循环卷积的 $$\textsf{iNTT}^{\varphi}$$，同样令局部根为：

$$
\varphi_m = \varphi^{n/m}
$$

然后把 $$\omega_m^j$$ 替换为 $$\varphi_m^{2j+1}$$：

$$
\begin{cases}
a_{\text{start}+j} \leftarrow 2^{-1}(u+v) \pmod q \\
a_{\text{start}+j+m/2} \leftarrow 2^{-1}(u-v)(\varphi_m^{2j+1})^{-1} \pmod q
\end{cases}
$$

{% plain error title="Fast NTT 复杂度" %}

无论 CT 还是 GS，每一层都会覆盖全部 $$n$$ 个元素，并执行 $$n/2$$ 个蝴蝶。由于 $$n=2^k$$，层数为 $$\log_2 n$$，因此总共有：

$$
\frac{n}{2}\log_2 n
$$

个蝴蝶操作。每个蝴蝶只包含常数次模加、模减和模乘，所以整体算术复杂度为：

$$
\mathcal{O}(n\log n)
$$

bit-reversal 重排需要 $$\mathcal{O}(n)$$ 到 $$\mathcal{O}(n\log n)$$ 的位操作，取决于具体实现方式；在 NTT 的模乘计数模型下，它通常不改变主导复杂度。相比递归实现，迭代实现避免了函数调用栈和递归切片的额外开销，更贴近硬件电路或常数时间软件实现中的蝴蝶网络。
{% endplain %}
