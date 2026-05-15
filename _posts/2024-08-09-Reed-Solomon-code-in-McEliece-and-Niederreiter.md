---
tags: Code-Based-Cryptography Reed-Solomon-Code Sidelnikov-Shestakov-Attack
title: Reed-Solomon code in McEliece and Niederreiter
key: rs-mceliece-niederreiter
lang: zh
bilingual: true
---

{: .info}
**概要:** 介绍 Generalized Reed-Solomon Code（GRS），McEliece 和 Niederreiter 加密算法。GRS 虽然是非常高效的线性编码，但是在标准的 McEliece 中使用了 Goppa Code，而不是更简单高效的 GRS 编码，是因为 GRS 编码在上述两个密码体制中存在安全性问题，即 Sidelnikov-Shestakov attack。本篇博客是对 GRS 线性编码和其相关攻击的简单介绍。

<!--more-->

主要参考文献：

1. [Brief of Sidelnikov Shestakov Attack for GRS Codes-based Cryptosystems](https://www.researchgate.net/publication/369325541_Brief_of_Sidelnikov_Shestakov_Attack_for_Generalized_Reed-Solomon_Codes-based_Cryptosystems)
2. [Sidelnikov-Shestakov attack on Reed-Solomon code in McEliece](https://crypto-kantiana.com/elena.kirshanova/talks/Sidelnikov_Shestakov.pdf)




## Generalized Reed-Solomon Code

{: .error}
**定义** ： Generalized Reed-Solomon Code

正整数 $k \le n \le q$ ，令 $\alpha \in \mathbb{F}_q^n$  是不同元素的 n-元组，即 $\alpha=\left(\alpha_1, \ldots, \alpha_n\right)$ ，其中 $\alpha_i \neq \alpha_j, \forall i \neq j \in\{1, \ldots, n\}$ ；令 $\beta \in \mathbb{F}_q^n$ 是非零的 n-元组，即 $\beta=\left(\beta_1, \ldots, \beta_n\right)$，其中 $\beta_i \neq 0 , i \in \{1, \ldots, n\}$，广义的里德-所罗门编码（Generalized Reed-Solomon Code），码字长度为 $n$ ，线性子空间维数为 $k$ ，记为 $\operatorname{GRS}_{n,k}(\alpha,\beta)$，其码字空间定义如下：

$$
\operatorname{GRS}_{n, k}(\alpha, \beta)=\left\{\left(\beta_1 f\left(\alpha_1\right), \ldots, \beta_n f\left(\alpha_n\right)\right) \mid f \in \mathbb{F}_q[x], \operatorname{deg}(f)<k\right\} .
$$

在 $\beta=(1, \ldots, 1)$ 时，我们称其为 Reed-Solomon (RS) 编码，记为  $\operatorname{RS}_{n, k}(\alpha)$ 。

&nbsp;

### 生成矩阵

GRS 编码的生成矩阵可以解释为类似于 Vandermonde 矩阵乘以对角矩阵，其中每一行对应多项式的不同次数的项（从 0 到 $k-1$），每列对应不同的评估点 $a_i$，乘以权重向量中相应的 $\beta_i$。

比如 $\beta_i = 1$ 时，范德蒙矩阵就是最常见的 RS 编码，生成矩阵为：

$$
G_{RS} = \left(\begin{array}{ccc}
1 & \cdots & 1 \\
\alpha_1 & \cdots & \alpha_n \\
\vdots & & \vdots \\
\alpha_1^{k-1} & \cdots & \alpha_n^{k-1}
\end{array}\right)
$$

广义的  $\operatorname{GRS}_{n, k}(\alpha, \beta)$ 的生成矩阵为：

$$
G_{GRS} = \left(\begin{array}{ccc}
1 & \cdots & 1 \\
\alpha_1 & \cdots & \alpha_n \\
\vdots & & \vdots \\
\alpha_1^{k-1} & \cdots & \alpha_n^{k-1}
\end{array}\right)

\left(\begin{array}{ccc}
\beta_1 & &  & \\
 & \beta_2 & & \\
 & & \ddots \\
 & & & \beta_n
\end{array}\right)
$$


&nbsp;

**多项式表达**：按照定义 GRS 编码的消息实际上是 $(k-1)$-次多项式在 $n$ 个点上的评估值，记消息为 $m = (f_0, f_1, \cdots , f_{k-1})$ ，对应某个多项式 $f(x) = \sum_{i=0}^{k-1} f_i x^i$ 的 $k$ 个系数，则编码后消息为：

$$
\begin{aligned}
c_m &= m \cdot G_{GRS} \\
&= \left(f_0, f_1, \cdots, f_{k-1}\right) \left(\begin{array}{ccc}
1 & \cdots & 1 \\
\alpha_1 & \cdots & \alpha_n \\
\vdots & & \vdots \\
\alpha_1^{k-1} & \cdots & \alpha_n^{k-1}
\end{array}\right)

\left(\begin{array}{ccc}
\beta_1 & &  & \\
 & \beta_2 & & \\
 & & \ddots \\
 & & & \beta_n
\end{array}\right) \\
&=  \left(f(\alpha_1), f(\alpha_2), \cdots,f(\alpha_n)\right) 
\left(\begin{array}{ccc}
\beta_1 & &  & \\
 & \beta_2 & & \\
 & & \ddots \\
 & & & \beta_n
\end{array}\right) \\
&=   \left(\beta_1 f(\alpha_1), \beta_2 f(\alpha_2), \cdots, \beta_n f(\alpha_n)\right) 

\end{aligned}
$$


{: .warning}
**Remarks**: GRS 编码都是 MDS 编码，即 GRS 的最小汉明距离达到最大上界 Singleton Bound，纠错能力达到最大上限。GRS 的快速唯一解码算法可在多项式时间内修正 $t = \lfloor \frac{n-k}{2} \rfloor$ 个错误。



### 校验矩阵

校验矩阵 $H$ 满足

$$
\forall c \in \mathcal{C}(G), \quad cH = 0 \\
\iff  GH = 0 \\
\implies H = \mathcal{KER}_{R}(G)
$$

即 $H$ 为生成矩阵 $G_{GRS}$ 的右核空间。



特别地，GRS 编码的对偶编码也是 GRS 编码，对偶编码的生成矩阵即上述 $H$ 。


&nbsp;

**定理**：$\operatorname{GRS}_{n, k}(\alpha, \beta)$ 的对偶编码（对偶的生成矩阵即为校验矩阵）满足：

$$
\boldsymbol{G R S}_{n,k}(\boldsymbol{\alpha}, \boldsymbol{\beta})^{\perp}=\boldsymbol{G R S}_{n,n-k}\left(\boldsymbol{\alpha}, \boldsymbol{\gamma}\right),
$$

其中 $\gamma$ 向量满足

$$
\gamma_i=\beta_i^{-1} \prod_{\substack{j=1 \\ j \neq i}}^n\left(\alpha_i-\alpha_j\right)^{-1} .
$$

相关证明参考 [Introduction to Coding Theory. Section 6.2](https://wwwlix.polytechnique.fr/~alain.couvreur/doc_ens/lecture_notes.pdf)。



## Niederreiter & McEliece 

Niederreiter 是最早的一批基于线性编码的后量子密码体制，而 McEliece 则是 NIST 标准里最著名的也最 promising 的后量子密码。而在这两种密码体制中使用 GRS 编码都是不安全的。

基于编码的密码学体制的原理都是大同小异的，核心都是利用隐藏编码结构作为陷门，即：

- 公钥通过矩阵掩码隐藏结构，表现得类似随机编码，纠错解码效率一般。
- 私钥拥有者拥有陷门信息，可以将密文转化为特殊编码的码字，以高效解码得到消息。


&nbsp;

Niederreiter 和 McEliece 的核心区别在于：

- Niederreiter 将明文编码为误差向量，最后加密得到 syndrome （基于 **Syndrome Decoding Problem**）
- McEliece 将明文编码为明文空间向量，最后加密得到含错的码字（基于纠错解码问题）

而纠错解码问题和 SDP 问题本质是一样的。



### Niederreiter Cryptosystem

{: .success}
**Step 1. 密钥生成**

- 生成随机置换矩阵 $P_{n \times n}$
- 生成随机可逆矩阵 $S_{(n-k) \times (n-k)}$
- 编码参数为 $(n, k)$ 的 GRS 校验矩阵：$H_{(n-k) \times n}$，最大纠错能力为 $t$。
- **公钥**：${\hat H} = (SHP)_{(n-k) \times n}$
- **私钥**：矩阵 $S, H, P$


{: .success}
**Step 2. 加密**

- 明文编码：将消息编码为 $n$ 维的误差向量，其中 $m$ 的汉明重量小于 $t$。

- 加密：密文为对应误差向量的 syndrome，即
  $$
  c = {\hat H} \cdot m^T
  $$


{: .success}
**Step 3. 解密**

- 计算 $\bar c = S^{-1}c = H(mP^T)^T$
- 根据 GRS 的解码算法，解码得到 $y$ 使得 $Hy^T = \bar c$
- 根据编码理论上述解码值唯一，即 $y = mP^T$
- 恢复明文：$m = yP$ （置换矩阵满足 $PP^T = I$）



### McEliece Cryptosystem

{: .success}
**Step 1. 密钥生成**

- 生成随机置换矩阵 $P_{n \times n}$
- 生成随机可逆矩阵 $S_{k \times k}$
- 选取高效 $(n,k)$-线性编码，比如 Goppa 编码等，得到生成矩阵 $G_{k \times n}$ ，最大纠错能力为 $t$ 。
- **公钥**：$(\hat G = (SGP)_{k \times n}, t)$
- **私钥**：矩阵 $S, G, P$


{: .success}
**Step 2. 加密**

- 明文编码：将消息编码为 $k$ 维的明文向量 $m$。

- 加密：生成随机的汉明重量为 $t$ 的误差向量 $z \in \mathbb{F}_{q}^{n}$，密文即为含错码字：
  
  $$
  c = m \hat G + z
  $$


{: .success}
**Step 3. 解密**

- 计算 $\bar c = c P^{-1} = (mS)G + zP^{-1}$ 
- 因为 $P^{-1} = P^T$ 也是置换矩阵，因此 $zP^{-1}$ 汉明重量小于 $t$。
- 对 $\bar c $ 使用对应编码进行高效解码，得到 $y = mS$
- 恢复明文：$m = y S^{-1}$



## Sidelnikov-Shestakov attack

如果使用 GRS 编码，生成矩阵和校验矩阵本质都是一样的，从分析的角度看，在 Niederreiter 和 McEliece 都是一样的。我们以 Niederreiter 为例，介绍 GRS 编码的 Sidelnikov-Shestakov 攻击，又名 Russian Attack。

Sidelnikov-Shestakov 攻击的思路在于通过公钥 $\hat{H}$ 恢复出 GRS 编码的结构，注意到任意 GRS 的校验矩阵左乘以一个置换矩阵（列置换），仍然是一个 GRS 编码，因此我们的目标是恢复出一个等价 ${GRS}_{n, k}(\alpha, \beta)$ 编码的校验矩阵 $\bar{H} = HP$。即恢复出等价向量：

$$
\alpha = (\alpha_1, \cdots, \alpha_{n}), \beta = (\beta_1, \cdots, \beta_{n})
$$


### 代数表达

上述问题可以完整建模为下述场景，私钥为 $H_{(n-k) \times n}$ 为一个 $GRS_{n, k}(\alpha, \beta)$ 编码的校验矩阵，给定一个 Niederreiter 公钥 $\hat H = S H$ ，恢复出一个等价 $GRS_{n, k}(\bar \alpha, \bar \beta)$ 编码的校验矩阵。即求解出一组 $S, H$ 或者 $\alpha, \beta$ 向量。

为了方便表达，我们直接考虑 $k \times n$ 的校验矩阵完整表达式：

$$
\begin{aligned}
\hat H &= S \cdot H \\
&= 
\left(\begin{array}{ccc}
s_{1,1} & s_{1,2} & \cdots & s_{1, k} \\
s_{2,1} & s_{2,2} & \cdots & s_{2, k} \\
 \vdots &\vdots & \cdots & \vdots \\
s_{n-k,1} & s_{n-k,2} & \cdots & s_{k, k} 
\end{array}\right)

\left(\begin{array}{ccc}
\beta_1 1 & \cdots & \beta_n 1 \\
\beta_1 \alpha_1 & \cdots & \beta_n \alpha_n \\
\vdots & \ddots & \vdots \\
\beta_1 \alpha_1^{k-1} & \cdots & \beta_n \alpha_n^{k-1}
\end{array}\right)\\
&= \left(\begin{array}{ccc}
\beta_1 f_1(\alpha_1) & \beta_2 f_1(\alpha_2) & \cdots  & \beta_n f_1(\alpha_n) \\
\beta_1 f_2(\alpha_1) & \beta_2 f_2(\alpha_2) & \cdots  & \beta_n f_2(\alpha_n) \\
\vdots & \vdots & \ddots & \vdots \\
\beta_1 f_{k}(\alpha_1) & \beta_2 f_{k}(\alpha_2) & \cdots  & \beta_n f_{k}(\alpha_n) \\
\end{array}\right)_{k \times n}
\end{aligned}
$$


其中多项式 $f_i(x) = \sum_{j} s_{i, j} x^j$ 是 $k-1$ 次多项式。由于 $S$ 是可逆矩阵，因此 $f_i(x)$ 为线性无关的多项式。


&nbsp;

**关键点**

对 GRS 编码进行线性（有理）变换，考虑变换：

$$
(ax + b)^i = \sum_{j=0}^{k - 1} m_{i,j} x^j \\
\implies M = (m_{i,j}) , \quad \text{lower-triangular}
$$

因此矩阵 $M$ 左乘于,  $GRS_{n, k}(\alpha, \beta)$ 编码的校验矩阵，得到一个新 $GRS_{n, k}(\bar \alpha, \bar  \beta)$ 编码的校验矩阵，其中

$$
\bar \alpha = (a \alpha_1 + b, \cdots, a \alpha_{n} + b), \bar \beta = (\beta_1, \cdots, \beta_{n})
$$

因此：

$$
\hat H = \underbrace{SM^{-1}}_{S^\prime} \underbrace{MH}_{H^\prime}
$$

则 $S^\prime, H^\prime$ 也是一个可行解，记该解为 $S^\prime, \bar \alpha, \bar \beta$ 。

为了方便表示，将 $\infty$ 并入 $\mathbb{F}_q$ 中考虑，记为 $\mathbb{F}_q^{\infty}$，满足：

$$
\left\{\begin{array}{lr}
\frac{1}{\infty} = 0 \\
\frac{1}{0} = \infty \\
f(\infty) = f_{degf}
\end{array}
\right.
$$


实际上，考虑任意双有理变换

$$
\phi(x) = \frac{ax+ b}{cx + d}, \quad ab -cd \ne 0
$$

生成一个新的解 $SM_{\phi}^{-1}, \phi(\alpha), \tau(\beta)$ 。其中

$$
\phi(\alpha) =
\left\{\begin{array}{lr}
\infty & c \alpha + d = 0 \\
0 & a \alpha+ b = 0 \\
\frac{a \alpha + b}{c \alpha + d} & \text{other case}
\end{array}
\right.
\\
\tau(\beta) =
\left\{\begin{array}{lr}
\beta & \phi(\alpha) \ne \infty \\
a^{k-1} & \phi(\alpha) = \infty 
\end{array}
\right.
$$


因此对于任意 $\alpha_1, \alpha_2, \alpha_3 \in \mathbb{F}_q^{\infty}$，我们可以找到某个双有理变换使得，

$$
\begin{aligned}
\phi(\alpha_1) &= 1 \\
\phi(\alpha_2) &= 0 \\
\phi(\alpha_3) &= \infty 
\end{aligned}
$$

我们想要搜索如下特殊形式的解：

$$
\bar S, \bar \alpha = (1, 0, \infty, a_4, \cdots , \alpha_{n}), \bar \beta = (\beta_1, \cdots, \beta_{n}), \alpha_i \notin \{0,1, \infty\} \quad i \ge 4 \tag{a}
$$


### RS 特殊求解

形如 $(a)$ 中的解代入公钥：

$$
\begin{aligned}
\hat H &= \bar S \cdot \bar H \\
&= \left(\begin{array}{ccc}
\beta_1 f_1(\alpha_1) & \beta_2 f_1(\alpha_2) & \cdots  & \beta_n f_1(\alpha_n) \\
\beta_1 f_2(\alpha_1) & \beta_2 f_2(\alpha_2) & \cdots  & \beta_n f_2(\alpha_n) \\
\vdots & \vdots & \ddots & \vdots \\
\beta_1 f_{k}(\alpha_1) & \beta_2 f_{k}(\alpha_2) & \cdots  & \beta_n f_{k}(\alpha_n) \\
\end{array}\right)_{k \times n}
\end{aligned}
$$

首先考虑 $\beta_1 = \beta_2 =\cdots = \beta_{n}  = 1$ 的简单情况。


{: .success}
**Step 1. 求解核空间 $\\{1, k + 1, k+2, \cdots, 2k - 2\\}$**

选取 $k-1$ 个列向量 $\\{1, k + 1, k+2, \cdots, 2k - 2\\}$，令 $c_1 \in \mathbb{F}_q^{k}$ ，求它们的左核空间：

$$
\begin{aligned}
\left\langle\mathbf{c}_1, f^{(i)}\left(\alpha_1\right)\right\rangle & =0, \\
& \vdots \\
\left\langle\mathbf{c}_1, f^{(i)}\left(\alpha_{2(k-1)}\right)\right\rangle & =0 .
\end{aligned}
$$

令：

$$
F_1(x) := \sum_{i=1}^{n-k} c_{1, i} f^{(i)}(x)
$$

则 $F_1(x)$ 在 $\alpha_1, \alpha_{k + 1},  \alpha_{k + 2}, \cdots,  \alpha_{2(k - 1)}$ 处取值为 0，并且 $F_1(x)$ 次数不超过 $k-1$ ，因此，它必然为下面形式的多项式：

$$
F_1(x)=a_1\left(x-\alpha_1\right)\left(x-\alpha_{k+1}\right) \cdots\left(x-\alpha_{2(k-1)}\right) \tag{F1}
$$

其中

$$
a_1 = F_1(\infty) = F_1(\alpha_3) = \sum_{i=1}^{k} c_{1,i} f^{(i)}(\alpha_3) = \sum_{i=1}^{k} c_{1,i} \hat H_{i, 3}
$$

除此之外，任意零点之外的 $\alpha_j$ 在 $F_1(x)$ 处的点值都可以通过矩阵 $\hat H$ 计算得到：

$$
F_1\left(\alpha_j\right)=\sum_{i=1}^{k} c_{1, i} f^{(i)}\left(\alpha_j\right)=\sum_{i=1}^{k} c_{1, i} \hat H_{i, j} \tag{E1}
$$

{: .success}
**Step 2. 求解核空间 $\\{2, k + 1, k+2, \cdots, 2k - 2\\}$**

同理求解左核空间得到向量 $c_2 \in \mathbb{F}_q^{k}$，从而得到

$$
F_2(x)=a_2\left(x-\alpha_2\right)\left(x-\alpha_{k+1}\right) \cdots\left(x-\alpha_{2(k-1)}\right) \tag{F2}
$$

其中

$$
a_2 = F_2(\infty) = F_2(\alpha_3) = \sum_{i=1}^{k} c_{2,i} f^{(i)}(\alpha_3) = \sum_{i=1}^{k} c_{2,i} \hat H_{i, 3}
$$

除此之外，任意零点之外的 $\alpha_j$ 在 $F_2(x)$ 处的点值都可以通过矩阵 $\hat H$ 计算得到：

$$
F_2\left(\alpha_j\right)=\sum_{i=1}^{k} c_{2, i} f^{(i)}\left(\alpha_j\right)=\sum_{i=1}^{k} c_{2, i} \hat H_{i, j} \tag{E2}
$$

{: .success}
**Step 3. 求解一组 $\\{\alpha_4, \alpha_5, \cdots, \alpha_{k}\\}$**

从 (F1) 和 (F2) 的表达式以及 (E1) 和 (E2) 在 $\alpha_4, \alpha_5, \cdots, \alpha_{k}$ 处的已知非零点值，得到：

$$
\begin{aligned}
\frac{F_1\left(\alpha_j\right)}{F_2\left(\alpha_j\right)} & =\frac{a_1\left(\alpha_j-\alpha_1\right)\left(\alpha_j-\alpha_{k+1}\right) \cdots\left(\alpha_j-\alpha_{2(k-1)}\right)}{a_2\left(\alpha_j-\alpha_2\right)\left(\alpha_j-\alpha_{k+1}\right) \cdots\left(\alpha_j-\alpha_{2(k-1)}\right)} \\
& =\frac{a_1\left(\alpha_j-\alpha_1\right)}{a_2\left(\alpha_j-\alpha_2\right)}
\end{aligned}
$$

由已知假设 $\alpha_1=1, \alpha_2=0$，上述方程易解得

$$
\alpha_j=\frac{a_1 / a_2}{a_1 / a_2-F_1\left(\alpha_j\right) / F_2\left(\alpha_j\right)} \quad 4 \leq j \leq k
$$

实际上，$j$ 取值可以是任意 $j \notin \\{1, 2, k + 1, k+2, \cdots, 2k - 2\\}$


{: .success}
**Step 4. 求解完整解 $\\{\alpha_1, \alpha_2, \cdots, \alpha_{n}\\}$**

实际上如果上一步求出的 $\alpha_j$ 数目大于 $k$ 个，即可直接通过拉格朗日插值恢复出完整的 $F_1(x), F_2(x)$ 系数，进而求解根得到未知的零点 $\alpha_j, j \in \\{1, 2, k + 1, k+2, \cdots, 2k - 2\\}$。由于我们不知道这些根的正确顺序，这不足以恢复出一组正确的解。

为了得到完整解，同理我们可以通过 $\hat H$ 的列向量 $\\{1,3, 4, \cdots, k\\}$ 和 $\\{2,3, 4, \cdots, k\\}$ 的核空间构成的函数 $F_3(x), F_4(x)$ 求解得到未知点 $\alpha_j, j \in k + 1, k+2, \cdots, 2k - 2$ 的值。整体思路就是每次将已知的 $\alpha_j$ 对应的列向量加入核空间中去求解 $F(x)$, 从而逐步恢复出完整的 $\alpha$ 向量。

{: .warning}
**Remarks**：（a）在 $\alpha_3 = \infty$ 处为零，意味着首项为 0，即 $x^{k-1}$ 的系数为 0，即最高次数降为 $k - 2$ 。（b）上述攻击算法的时间复杂度为 $\mathcal{O}(n^3)$ !


### GRS 一般求解

考虑一般形式下 $\beta_i \ne  1$ ,

$$
\begin{aligned}
\hat H &= \bar S \cdot \bar H \\
&= \left(\begin{array}{ccc}
\beta_1 f_1(\alpha_1) & \beta_2 f_1(\alpha_2) & \cdots  & \beta_n f_1(\alpha_n) \\
\beta_1 f_2(\alpha_1) & \beta_2 f_2(\alpha_2) & \cdots  & \beta_n f_2(\alpha_n) \\
\vdots & \vdots & \ddots & \vdots \\
\beta_1 f_{k}(\alpha_1) & \beta_2 f_{k}(\alpha_2) & \cdots  & \beta_n f_{k}(\alpha_n) \\
\end{array}\right)_{k \times n}
\end{aligned}
$$

通过给 $\bar H$ 乘以 $\beta_1^{-1}$ ，对 $\bar S$ 乘以 $\beta_1$ ，我们总可以使得第一列的 $\beta$ 乘子等于 1 。因此不妨假设 $\beta_1 = 1$ 。

考虑核空间

$$
\begin{aligned}
\left\langle\mathbf{c}_1, \beta_1 f^{(i)}\left(\alpha_1\right)\right\rangle & =0, \\
& \vdots \\
\left\langle\mathbf{c}_1, \beta_{2(k - 1)} f^{(i)}\left(\alpha_{2(k-1)}\right)\right\rangle & =0 .
\end{aligned} \tag{K}
$$

非零常量的引入不会影响 kernel 的结构，得到的 $F_1(x)$ 仍然满足下述形式：

$$
F_1(x)=a_1\left(x-\alpha_1\right)\left(x-\alpha_{k+1}\right) \cdots\left(x-\alpha_{2(k-1)}\right) \tag{F1}
$$

即 $\beta_i$ 的引入只是改变了 $c_i$ 的值。而不会影响函数 $F_1$ 。因此恢复出所有 $\\{\alpha_1, \alpha_2, \cdots, \alpha_{n}\\}$ 之后，我们考虑恢复出 $\beta$ 向量。


因为，$\beta$ 的信息与 $\alpha$ 信息在矩阵中分布是相反的，这里我们考虑 $k$ 组 $k+1$ 维的行向量的核空间，维度以 $1, 2, \cdots, k+1$ 为例，从矩阵的方式考虑方程，这里的关键点是利用 $f_i$ 的线性独立关系去除系数矩阵 $S_{k \times k}$ 的影响：

$$
\begin{gathered}
\sum_{j=1}^{k+1} c_j \beta_j f^{(i)}\left(\alpha_j\right)=0 \quad 1 \leq i \leq k \\
\Longleftrightarrow \\
S \cdot V\left(\alpha_1, \ldots, \alpha_n\right) \cdot \operatorname{Diag}(\mathbf{c}) \cdot \mathbf{\beta} =0 \\
\Longleftrightarrow(S \text { is invertible }) \\
V\left(\alpha_1, \ldots, \alpha_n\right) \cdot \operatorname{Diag}(\mathbf{c}) \cdot \mathbf{\beta} =0
\end{gathered}
$$


其中 $V\left(\alpha_1, \ldots, \alpha_n\right)$ 是 $k \times n$ 的部分范德蒙矩阵，$\mathbf{\beta}$ 是 $(\beta_1, \cdots, \beta_{k+1})$ 向量，$\mathbf{c}$ 是核空间的向量，可以通过矩阵 $\hat H$ 计算得到（$k$ 组 $k+1$ 维的行向量的核空间）。

固定 $\beta_1 = 1$，上述 $k$ 组方程刚好生成唯一解。重复上述过程，我们可以恢复出完整的 $\bar \beta = (\beta_1, \cdots, \beta_{n})$ 向量。


&nbsp;

{: .warning}
**Remarks**：有理变换得到编码矩阵

从特殊解到一般形式的解，上述提到的解形式为 $\alpha = \\{1, 0, \infty, \alpha_4, \alpha_5, \cdots, \alpha_{k}\\}$，这样的解是无法形成校验矩阵的，因此得到该形式的解之后，我们可以通过有理变换，得到一组真正的解。

选择随机元素 $r \in \mathbb{F}_q$ ，与 $\alpha$ 中元素互异，则进行下述有理变换得到一组正解：

$$
\alpha^\prime:=  \{\alpha_j^\prime = \frac{1}{r - \alpha_j}\}
$$

{: .error}
**关于 $\infty$**: 在有限域中，$\infty$ 是不存在的，因此我们需要将 $\infty$ 与有限域元素统一处理，在射影几何中，我们将有限域 $\mathbb{F}_q$ 上的仿射直线 $\mathbb{A}^1$ 扩展为射影直线 $\mathbb{P}^1$。射影直线 $\mathbb{P}^1$ 包含了仿射直线上的所有点以及一个额外的无穷远点 $\infty$ 。这似乎是有限域多项式一个比较 tricky 的地方，笔者在这里也没有深入研究，根据极限理论，$f(\infty)$ 由首项系数主导，直觉上它的值只与首项系数有关。在已知多项式的次数和所有零点的情况下，仅首项系数是未知的，故而引入无穷远点可以快速确定多项式的首项系数，因此令 $\alpha_3 = \infty$，可以完全确定多项式的分解形式。


## SageMath Implementation

使用 SageMath 10.3 实现上述加密算法的仓库： [Code-Based-Cryptography](https://github.com/tl2cents/Code-Based-Cryptography).

---
