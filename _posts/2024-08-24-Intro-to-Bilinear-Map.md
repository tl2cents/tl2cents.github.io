---
tags: Pairing-Based-Cryptography MOV-Attack DDH IBE 
title: Intro to Bilinear Map
key: intro-to-bilinear-map
bilingual: true
lang: zh
---

{: .info}
**概要:** 介绍双线性映射（Bilinear Map）的定义、性质，以及双线性映射在密码学中的应用：MOV 攻击，单轮三方 DH 协议， Identity-Based Encryption 等。

<!--more-->


双线性映射（Bilinear Map）可以在不同的群之间建立线性关系，自 2001 年 Boneh 和 Franklin 首次在基于身份的加密 （Identity Based Encryption）中应用到双线性映射函数后，它迅速成为密码学的热门研究方向，在很多新兴的密码方向都有着重要意义，比如零知识证明和 Pairing-Based Cryptography。基于双线性映射的密码分析方法（尤其是椭圆曲线群），一个典型的例子就是 MOV Attack，它基于某些 Pairing-Friendly 的椭圆曲线，利用双线性映射去转换离散对数问题。



## Bilinear Map 定义

令 $G_1, G_2, G_t$ 为相同阶的循环群，不失一般性，我们定义群运算为乘法符号 $(\cdot)$ 。

**Bilinear Map** ：记  $e:G_1 \times G_2 \mapsto G_t$ 是一个从直积群 $G_1 \times G_2$ 到 $G_t$ 的映射。 $e:G_1 \times G_2 \mapsto G_t$ 被称为双线性映射，意味着对任意 $u \in G_1, v \in G_2, a,b \in \mathbb{Z}$ ，满足：

$$
e(u^a, v^b) = e(u,v)^{ab} \tag{1}
$$

注记：

1. 双线性映射也被称为 **Pairing**，因为它们将 $G_1$ 和 $G_2$ 中的元素对与 $G_t$​​ 中的元素相关联。
2. 实际上，群运算符号可以为任意，比如均为加法群 $(+)$ ，记 $[a]P = \underbrace{P + \cdots + P}_{a}$ ，则双线性映射的条件可以记为 $e([a]u, [b]v) = [ab]e(u,v)$ ，最常用的 Pairing 是椭圆曲线加法群 $G_1 = G_2 = E$ 到有限域乘法群 $G_t = \mathbb{F}_q$ 的映射，即  $e([a]u, [b]v) = e(u,v)^{ab}$ 。它们数学本质上是一样的，为了简便，本文后续均用乘法群表示。
3. 更一般地，双线性映射定义可以分解为，对于任意 $x_1,x_2 \in G_1, y_1, y_2 \in G_2, c \in \mathbb{Z}$​ ，满足：
   1. 线性一：$e(x_1 \cdot x_2,y) = e(x_1,y) \cdot e(x_2, y)$
   2. 线性二：$e(x,y_1 \cdot y_2) = e(x,y_1) \cdot e(x, y_2)$​
   3. 线性三：$e(x^c,y) = e(x,y)^c = e(x, y^c)$


注意到，上述定义允许将所有元素对映射到 $G_t$ 的单位元 $1$ ，从而一个平凡映射 $e : \forall u \in G_{1}, \forall v \in u, e(u,v) = 1$ 也是一个双线性映射，但是这样平凡的（trivial）双线性映射对密码学而言，没有研究意义。密码学关注的是应该是 **非平凡的（non-trivial）、可计算的双线性映射。**

{: .error}
**Admissible Bilinear Map**
记  $e:G_1 \times G_2 \mapsto G_t$ 是一个双线性映射，记 $g_1, g_2$ 分别是群 $G_1, G_2$ 的生成元。如果 $e(g_1,g_2)$  生成 $G_t$  并且 $e$ 能够有效可计算（比如，多项式时间内），则映射 $e$ 称为可接受的双线性映射。
这些是我们唯一关心的双线性映射。有时这样的映射表示为 $\hat{e}$ 。本文继续使用 $e$ ，此外，从现在开始，后文提及双线性映射时，我们隐含的意思是可接受的双线性映射。


### 关于群 $G_1, G_2, G_t$

双线性映射中群 $G_1, G_2, G_t$ 的选取和性质：

- **同构性**：$G_1,G_2,G_t$ 都是彼此同构的，因为它们具有相同的阶并且都是循环群。（请注意，尽管它们是同构的，但是寻找出可计算的同构映射是困难的，特别是群的阶特别大时）
- **差异性**：从某种意义来说，它们（可以）是不同的群，因为我们用不同方式表达群中的元素，并且群运算也不尽相同。
- 一般来说，双线性映射中 $G_1 = G_2$ ，从现在开始，除非另有说明，否则用$G = G_1 = G_2$ 表示两者。群 $G$ 的阶可以合数，也可以是素数（大多数情形）。
- **自双线性映射（self-bilinear map）：** 如果 $G = G_t$ ，则称为自双线性映射，这是一个 Open Problem：即如何构造出自双线性映射。


&nbsp;

常见的双线性映射都是从有限域上的椭圆曲线加法群 $E : y^2 = x^3 + ax + b \mod p$ 到有限域 $\mathbb{F}_{q^k}$ 上的映射。即：

- 源群 $G$  ：通常选取某些特殊的椭圆曲线群（或者其子群）：超奇异曲线（Supersingular Curves），MNT Curves 等。
- 目标群 $G_t$ ：通常为一般有限域 $\mathbb{F}_{q^k}$ 。


更一般而言，G 通常是某些域上的阿贝尔簇（Abelian Variety），椭圆曲线群就是有限域上最常见的阿贝尔簇，其维度为 1。


### 拓展：阿贝尔簇

{: .warning}
本节部分内容由 ChatGPT-4o 模型生成，仅供参考。


Abelian variety（阿贝尔簇）是代数几何中的一个重要概念，**它是在某个域（field）上的一个完全的代数簇，具有群的结构，并且这个群的运算是可交换的（即满足交换律）**。即满足下述定义特点

- **完全的（Complete）**：在代数几何中，一个簇被称为完全的，如果它满足某种形式的“闭合性”条件，这意味着从几何角度来看，它没有“边缘”，类似于拓扑学中的紧致性。这个属性确保了阿贝尔簇上的积分路径独立性，是其具有良好代数性质的关键之一。
- **代数簇（Algebraic Variety）**：阿贝尔簇是一种特殊的代数簇，它可以通过代数方程的零点集在某个域上定义。这些方程是多项式方程，它们定义了在给定域上的点的集合。**例如，椭圆曲线方程 $y^2 = x^3 + ax + b$** 
- **群结构（Group Structure）**：阿贝尔簇上的点满足群的所有公理（存在单位元、逆元，以及满足结合律）。这个群的运算通常通过几何方法定义，**例如，椭圆曲线上的点加运算。**
- **交换律（Commutativity）**：阿贝尔簇的群运算是可交换的，这意味着对于任意两点 $P$  和 $Q$，都有 $P+Q=Q+P$。

熟悉有限域上椭圆曲线群的读者可以自行类比上述定义特点，作为最常见的阿贝尔簇，椭圆曲线群的维度为 1 。

&nbsp;

**阿贝尔簇**的维度是一个基本而重要的概念，它描述了阿贝尔簇作为一个代数簇的复杂性和几何形状的 "大小"。更具体地说，阿贝尔簇的维度指的是它作为一个平滑流形（在复数域上考虑时）或者作为一个代数簇（在任意域上考虑时）的维数。这个维度告诉我们阿贝尔簇局部上看起来像多少维的空间。以椭圆曲线为例：

- **从几何的角度上看**，椭圆曲线是简单的线形结构，即一维的阿贝尔簇。如果，方程的流形是一个平面（例如三个变量的方程），它就是二维的。以此类推。
- **从代数的角度上看**，维度可以理解为需要**多少个独立的参数来唯一确定阿贝尔簇上的一个点**。例如，一条线（如直线或椭圆曲线）是一维的，因为你可以用一个参数（比如曲线上点的坐标）来描述线上的每一个点。同样，一个平面或者曲面是二维的，因为描述平面或者曲面上的点需要两个参数。对于有限域上的椭圆曲线，给定一个 $x$ 坐标，它最多对应于两个点 $(x,y), (x,-y)$ (有限域上二次剩余个数)，这两个点是简单的互反关系，它们的代数性质几乎完全相同。

目前密码学上常用的阿贝尔簇包括：

1. **椭圆曲线**：最简单的一维阿贝尔簇，椭圆曲线在数论和密码学中有着广泛的应用。
2. **雅可比簇（Jacobian Varieties）**：给定一个光滑射影曲线，其雅可比簇是一个与之相关的阿贝尔簇，它参数化了曲线上的除数类。（比如 Hyper Elliptic Curve 的 Jacobian 除群）。



### 常用双线性映射

最早最著名的双线性映射是 Weil Pairing 和 Tate Pairing，之后基于它们提出了优化的 Pairing 算法，无一例外，**它们都是基于椭圆曲线的双线性映射。**

1. **Weil Pairing**：Weil 配对是定义在椭圆曲线上的一种双线性映射。它是配对密码学中使用的第一个配对类型之一，计算复杂性较高。
2. **Tate Pairing**：Tate 配对是一种相对于 Weil 配对计算效率更高的双线性映射。
3. **Ate Pairing**：Ate 配对是对 Tate 配对的改进，旨在进一步提高计算效率。
4. **Barreto-Naehrig(BN) Pairing**：BN 配对是一种特殊的配对类型，它在特定类型的椭圆曲线（称为 Barreto-Naehrig 曲线）上定义。

所有的这些双线性映射（pairing）都包含非常复杂的数学原理，并且计算代价比较昂贵，但是，针对双线性映射在密码学上的应用而言，*No need to understand and construct it to use them* ，并不需要理解构造原理。作为分析方法和工具，双线性配对在密码学上有着广泛的应用。（当然，如何构造更好的双线性配对和加速 pairing 计算也是热门研究方向）



## Bilinear Map 密码分析

前面提到过，双线性映射可以用于零知识证明协议设计、MOV Attack 等。本节介绍双线性映射在密码分析上的直接应用，主要包括：DDH 问题求解、MOV 规约。



### Decisional Diffie-Hellman

关于双线性映射，首先要了解的是它们对决策 Diffie-Hellman （DDH） 问题的影响。首先回顾一下 DH 协议，假定 Alice，Bob 要在不安全的信道上协商秘密密钥，他们首先选定一个乘法群 $G$，生成元 $g$ ，群的阶为 $q$ ，则

1. Alice 生成私钥 $a$ ，发送其公钥 $g^a$ 给 Bob
2. Bob 生成私钥 $b$ ，发送其公钥 $g^b$ 给 Alice
3. Alice 计算 $S = (g^b)^a = g^{ab}$ ，Bob 计算 $S = (g^a)^b =g^{ab}$ ，则 $S$ 为其秘密共享值。

给定 $g, g^a, g^b$ ，求解秘密值 $g^{ab}$ 是困难的，称其为 Computational Diffie-Hellman 问题（CDH），它基于 $G$ 上的离散对数问题是困难的：即给定 $g, g^a$ 求解私钥 $a$ 是困难的。而 DDH 问题是一个弱化的版本，假设给定 $g, g^a, g^b, g^c$ ，敌手如何判断 $g^c$ 是否是 DH 协议产生的秘密共享值 $s = g^{ab}$ 。正式定义如下。



**DDH** ：设 $G$ 是具有生成元 $g$ 的阶为 $q$ 的乘法群。概率算法 A 在求解 G 中的决策 Diffie-Hellman 问题时的优势定义为：

$$
\operatorname{Adv}_{\mathcal{A}, G}^{\mathrm{DDH}}=\left|\mathrm{P}\left[\mathcal{A}\left(g, g^a, g^b, g^{a b}\right)=1\right]-\mathrm{P}\left[\mathcal{A}\left(g, g^a, g^b, g^z\right)=1\right]\right|
$$

其中 $a, b, z$ 是从 $\mathbb{Z}_q$ 上的均匀分布中采样，概率取自 $a, b, z$  和 $\mathcal{A}$ 的输出：1 代表是判定为 DH 协议输出，0 代表不是 DH 协议输出。

容易得到，当存在多项式时间内概率算法 $\mathcal{A}$ 使得 $\operatorname{Adv}_{\mathcal{A}, G}^{\mathrm{DDH}} = 1$ 时，即意味着 DDH 问题多项式时间内可完全判定。 


{:.error}
**双线性映射求解 DDH**
如果群 $G$ 上存在双线性映射 $e:G \times G \mapsto G_t$ （群 $G_t$ 的选取任意），则存在多项式时间内的算法 $\mathcal{A}$ 使得 $\operatorname{Adv}_{\mathcal{A}, G}^{\mathrm{DDH}} = 1$ 。给定 $g, g^a, g^b, g^c$ 判定是否 $g^c = g^{ab}$ 等价于判定是否 $c \equiv ab \mod q$ ，根据双线性映射的定义，只需要判定是否 $e(g^a, g^b) = e(g, g^c)$ 。因此 DDH 问题是多项式时间内可判定的。



**Remarks**
- **XDH 假设**：假如群 $G_1, G_2$ 不相同，存在双线性映射 $e:G_1 \times G_2 \mapsto G_t$ ，只要 $G_1, G_2$ 之间不存在可有效计算的群同构，则 $G_1$ 和 $G_2$ 上的 DDH 问题仍可能是困难的。（比如一些 MNT Curves）
- **CDH 问题** ：假如 $G$ 上的 DDH 问题是简单的，其 CDH 问题可能仍然是困难的。
- **GDH 群** ：一个素数阶群 $G$，如果它的 CDH 问题是困难的， 而 DDH 问题是可解的，则 $G$ 被称为 Gap Diffie-Hellman （GDH）群。
- **零知识证明**：在 GDH 群上，Alice 可以在不泄露私钥 $a$ 的情况下证明她拥有数 $a$​，这一过程可以通过 DDH 挑战来实现。这完美符合零知识证明的场景！



### MOV 规约

本节考虑在双线性映射存在的情况下，群上的离散对数问题。



**定理（MOV规约）** ：假设存在双线性映射  $e:G \times G \mapsto G_t$ ，则群 $G$ 上的离散对数问题不会比 $G_t$ 上的离散对数问题更加困难。

证明是简单的，给定 $g, g^a \in G$ ，我们可以计算 $g_t = e(g,g)$ 和 $y_t = e(g, g^a) = e(g,g)^a =g_{t}^{a} \in G_t$ ，此时我们得到了群 $G_t$ 上的一组离散对数问题 $g_t, y_t = g_t^a$ ，并且解为原离散对数问题的解。这个规约过程被称为 MOV 规约，我们将其应用有限域上椭圆曲线群上，就能得到著名的 MOV Attack。

&nbsp;


首先介绍椭圆曲线上嵌入度的基本概念，给定素数 $p$ ，一个定义上有限域 $\mathbb{F}_p$ 上的椭圆曲线：$E: y^2 = x^3 + ax + b \mod p$ ，记 $\mathcal{O}(E)$ 为 $E$ 的阶，$\hat{E}$ 为群 $E$ 的一个素数阶子群。


**定理**：${\hat E}$ 与 $\mathbb{F}_{p^k}$ 之间存在双线性映射，当且仅当 $\mathcal{O}({\hat E}) \mid (p^k - 1)$​ 。

1. 充分条件：双线性映射的条件满足两个子群的阶相同，因此必然满足 $\mathcal{O}({\hat E}) \mid (p^k - 1) $ 。
2. 必要条件：由 Weil Pairing 或者 Tate Pairing 的构造给出。

&nbsp;

**嵌入度** ：满足上述条件最小的 $k$ 的称为椭圆曲线 $E$ 的嵌入度（embedding degree）。当嵌入度比较低时，比如 $k \le 6$ ，我们称其为配对友好曲线（pairing friendly curve）。

&nbsp;

**MOV Attack** ：基于 MOV 规约的攻击，给定椭圆曲线上的离散对数问题 $P, Q=[r]P$ ：

1. 计算曲线 $E$ 的嵌入度 $k$ 。
2. 计算双线性映射 $e:E \times E \mapsto {\mathbb{F}}_{p^{k}}$ 。
3. MOV 规约：选取一个任意基点 $G$ ，计算 $u = e(P, G), v = e(Q, G) =e([r]P, G) =e(P, G)^r$ ，
4. 我们得到离散对数问题 $u, v = u^r \in \mathbb{F}_{p^{k}}$ ，求解得 $r$ 。


基于 Sage 的 MOV Attack ，来自 [jvdsn's crypto attack](https://github.com/jvdsn/crypto-attacks/blob/master/attacks/ecc/mov_attack.py) ：

<details class="exploit">
<summary><b>MOV-Attack.py</b></summary>
<div markdown="1">

``` python
def get_embedding_degree(q, n, max_k):
    """
    Returns the embedding degree k of an elliptic curve.
    Note: strictly speaking this function computes the Tate-embedding degree of a curve.
    In almost all cases, the Tate-embedding degree is the same as the Weil-embedding degree (also just called the "embedding degree").
    More information: Maas M., "Pairing-Based Cryptography" (Section 5.2)
    :param q: the order of the curve base ring
    :param n: the order of the base point
    :param max_k: the maximum value of embedding degree to try
    :return: the embedding degree k, or None if it was not found
    """
    for k in range(1, max_k + 1):
        if q ** k % n == 1:
            return k
    return None

def attack(P, R, max_k=6, max_tries=10):
    """
    Solves the discrete logarithm problem using the MOV attack.
    More information: Harasawa R. et al., "Comparing the MOV and FR Reductions in Elliptic Curve Cryptography" (Section 2)
    :param P: the base point
    :param R: the point multiplication result
    :param max_k: the maximum value of embedding degree to try (default: 6)
    :param max_tries: the maximum amount of times to try to find l (default: 10)
    :return: l such that l * P == R, or None if l was not found
    """
    E = P.curve()
    q = E.base_ring().order()
    n = P.order()
    assert gcd(n, q) == 1, "GCD of base point order and curve base ring order should be 1."

    logging.info("Calculating embedding degree...")
    k = get_embedding_degree(q, n, max_k)
    if k is None:
        return None

    logging.info(f"Found embedding degree {k}")
    Ek = E.base_extend(GF(q ** k))
    Pk = Ek(P)
    Rk = Ek(R)
    for i in range(max_tries):
        Q_ = Ek.random_point()
        m = Q_.order()
        d = gcd(m, n)
        Q = (m // d) * Q_
        if Q.order() != n:
            continue

        if (alpha := Pk.weil_pairing(Q, n)) == 1:
            continue

        beta = Rk.weil_pairing(Q, n)
        logging.info(f"Computing {beta}.log({alpha})...")
        l = beta.log(alpha)
        return int(l)

    return None
```
</div>
</details>

{: .success}
**Remarks**：MOV 攻击的核心思想就是通过双线性映射将椭圆曲线上的离散对数问题转换到有限域上求解，当嵌入度 $k$ 比较小时，这个转换会大大降低离散对数的求解难度。比如取 $p$ 为 256 比特素数，椭圆曲线上的离散对数问题一般可以提供 128 比特的安全强度，对于嵌入度为 2 的曲线，转换到 $\mathbb{F}_{p^2}$ 上，其安全强度大约只有 60 比特。

{: .error}
**MOV 安全**：对于一般的安全曲线而言，其嵌入度非常大，基本与 $p$ 大小相同，甚至于计算嵌入度都是不可行的，即使可行，$\mathbb{F}_{p^k}$​ 上的离散对数问题也不会比原椭圆曲线群更简单，因此可以抵抗 MOV 攻击。MOV 攻击是选取安全曲线参数时必须要考虑的攻击。



## Bilinear Map 密码设计

上节阐述了双线性映射导致一系列新的密码分析方法，这一节着重于利用 Bilinear Map 进行密码体制、密码协议设计。双线性映射的性质让很多之前悬而未决的问题变得柳暗花明，也涌现了许多新的困难问题（DH）。



### Most Common New Problems

一个新分析工具的提出，必然伴随着一系列新的数学困难问题的产生。一些新问题已经在新的双线性背景下被定义和假设（均是困难的）：

- **Bilinear Diffie-Hellman** ：给定 $g, g^a, g^b, g^c$ ，计算 $e(g,g)^{abc}$ 。（类似于 “三向” CDH，但跨越两群）
- **Decisional Bilinear Diffie-Hellman** ：区分 $g, g^a, g^b, g^c, e(g,g)^{abc}$ 和 $g,g^a, g^b, g^c, e(g,g)^z$ 。
- **k-Bilinear Diffie-Hellman Inversion** ： 给定 $g,g^y, g^{y^2}, \cdots, g^{y^k}$ 计算 $e(g,g)^{\frac{1}{y}}$ 。
- **k-Decisional Bilinear Diffie-Hellman Inversion** ： 区分  $g,g^y, g^{y^2}, \cdots, g^{y^k}, e(g,g)^{\frac{1}{y}}$  和 $g,g^y, g^{y^2}, \cdots, g^{y^k}, e(g,g)^{z}$  。

&nbsp;

同时考虑跨不同群的双线性映射，即 $G_1, G_2$ 不同时，我们称为 "Co" 假设：

- **Computational Co-Diffie-Hellman** ：给定 $g_1, g_1^a \in G_1$ 和 $g_2, g_2^b \in G_2$ ，计算 $g_2^{ab}$ 。
- **Decisional Co-Diffie-Hellman** ： 区分  $g_1, g_1^a \in G_1$ 、 $g_2, g_2^b, g_2^{ab} \in G_2$ 和   $g_1, g_1^a \in G_1$ 、 $g_2, g_2^b, g_2^{z} \in G_2$​ 
- **Co-Bilinear Diffie-Hellman** ：给定   $g_1, g_1^a， g_1^b \in G_1$  和 $g_2 \in G_2$ ，计算 $e(g_1, g_2)^{ab}$ 。
- **Decisional Co-Bilinear Diffie-Hellman** ：区分 $g_1, g_1^a, g_1^b, g_2, e(g_1, g_2)^{ab}$ 和 $g_1, g_1^a, g_1^b, g_2, e(g_1, g_2)^{z}$。

基于双线性映射（又称 Pairing）的密码学，一般被称为 Pairing-Based Cryptography，它们大都基于上述假设的困难问题。



### One-round 3-party Diffie-Hellman

基于双线性映射设计的第一个密码协议是单轮的三方 DH 协议，它可以通过单轮交互完成。双线性映射的本质是通过类似“作弊”的机制，让你假装解决了一次 CDH 问题，即 $e(g^a, g^b) = e(g,g)^{ab} \in G_t$ ，但是这个计算结果是在新的群 $G_t$ 上，我们无法再继续进行 Pairing，只能让我们额外解决一个 CDH 问题。按照这个思路，单轮的三方 DH 协议就很平凡了。

&nbsp;

**Joux’s 3-Party Diffie-Hellman** ：给定一个素数阶群 $G$ ，阶为 $p$ ，存在双线性映射 $e:G \times G \mapsto G_t$ ，令 $g \in G$ 是生成元，记  $\hat{g} = e(g,g) \in G_t$ 。

1. Alice 随机选择 $a \stackrel{R}{\leftarrow} \mathbb{Z}_p$ ，Bob 随机选择 $b \stackrel{R}{\leftarrow} \mathbb{Z}_p$ ， Carol 随机选择 $c \stackrel{R}{\leftarrow} \mathbb{Z}_p$ 。
2. Alice，Bob，Carol 分别广播 $g^a, g^b, g^c$ 。
3. Alice 计算 $e(g^b, g^c) ^a = \hat{g}^{abc}$ ，Bob 计算 $e(g^c, g^a)^b = \hat{g}^{abc}$ ，Carol 计算 $e(g^a, g^b)^c = \hat{g}^{abc}$ 。

给定 $g, g^a, g^b, g^c$ ，我们并不能计算出 $\hat{g}^{abc}$ ，一个误导性的计算如 $e(g^a, e(g^b, g^c)) = e(g^a, \hat{g}^{bc}) = \hat{g}^{abc}$ 是不可行的，因为 $\hat{g} \in G_t$ 而不在 $G$ 上，双线性映射 $e$ 不能作用在 $\hat{g}$​ 上！

上述三方 DH 协议基于的困难问题假设正是 **Bilinear Diffie-Hellman** ：给定 $g, g^a, g^b, g^c$ ，计算 $e(g,g)^{abc}$ 是困难的。

 

###  IBE Scheme

基于身份的加密（identity based encryption）是一类绑定加密者身份的加密。Boneh 和 Franklin 在 2001 年第一次提出了用双线性映射构造 IBE 密码体制。IBE 的特点是公钥可以是任意字符串，例如电子邮件地址、电话号码等，这消除了传统公钥基础设施（PKI）中证书管理的需要。但是同时引入了一个中心的信任方，称之为 PKG ，他负责所有密钥的产生和分发。

{:.success}
**BF-IBE 加密算法**
公开参数：给定一个素数阶群 $G$ ，阶为 $p$ ，存在双线性映射 $e:G \times G \mapsto G_t$ ，令 $g \in G$ 是生成元，记  $\hat{g} = e(g,g) \in G_t$ ，记哈希函数 $h_1 : \\{0,1\\}^{\star} \rightarrow G, h_2 : G_t \rightarrow \\{0,1\\}^{\star}$ 。

1. 初始化（Setup） ：PKG 随机选择  $s \stackrel{R}{\leftarrow} \mathbb{Z}_p$​ ，生成 PKG 的公钥为 $g^s$​ 。

2. 密钥提取（Extract）：Alice 和 Bob 可以向 PKG 获取他们的私钥：
   
   $$
   S_a = \textsf{MakeKey}(s, \textsf{'Alice'}) = h_1(\textsf{'Alice'})^s \\
   S_b = \textsf{MakeKey}(s, \textsf{'Bob'}) = h_1(\textsf{'Bob'})^s
   $$

   
3. 加密（Encryption）：Alice 向 Bob 发送加密消息 $m$ ，随机选择 $r \stackrel{R}{\leftarrow} \mathbb{Z}_p$ ，然后计算密文：
   
   $$
   \begin{aligned}
   \textsf { Encrypt }\left(g, g^s, \textsf { 'Bob', } m\right) & =\left(g^r, m \oplus h_2\left(e\left(h_1(\textsf { 'Bob' }), g^s\right)^r\right)\right. \\
   & =\left( \underbrace{g^r}_{u}, \underbrace{ m \oplus h_2 (e(h_1(\textsf { 'Bob' }), g)^{r s}}_{v})\right)
   \end{aligned}
   $$


4. 解密（Decryption）：给定加密消息 $(u, v)=\left(g^r, m \oplus h_2\left(e\left(h_1(\textsf { 'Bob' }), g\right)^{r s}\right)\right.$ ， Bob 的私钥为 $w= h_1(\textsf{'Bob'})^s$ ，则解密算法为：$\textsf { Decrypt }(u, v, w)=v \oplus h_2(e(w, u)) $ 。验证如下：
   
   $$
   \begin{aligned}
   \textsf { Decrypt }(u, v, w)=v & \oplus h_2(e(w, u)) \\
   = m &\oplus h_2\left(e\left(h_1(\textsf { 'Bob' }), g\right)^{r s}\right) \\
    & \oplus h_2\left(e\left(h_1(\textsf { 'Bob' })^s, g^r\right)\right) \\
   =m & \oplus h_2\left(e\left(h_1(\textsf { 'Bob' }), g\right)^{r s}\right) \\
   & \oplus h_2\left(e\left(h_1(\textsf { 'Bob' }), g\right)^{r s}\right) \\
   =m \\
   \end{aligned}
   $$
   
&nbsp;

IBE 的核心原理和 Joux 的三方 DH 协议是类似的，令 Bob 的公钥为 $g^t = h_1(\textsf{'Bob'})$ ，其中 $t$ 是一个未知的数，从而观察整个加密过程，我们发现：

1. Alice 公钥为 $g^r$ ，私钥为 $r$ 
2. PKG 的公钥为 $g^s$ ，私钥为 $s$ 
3. Bob 的公钥为 $g^t$ ，私钥为 $t$ ，但是 $t$ 是未知且计算困难的，于是 PKG 混淆它的私钥给 Bob 颁发私钥 $g^{ts} = h_1(\textsf{'Bob'})^s$​ 。
4. 三方秘密共享值：$e(h_1(\textsf { 'Bob' }), g )^{r s} = e(g^t, g)^{rs} = \hat{g}^{rst}$ ，作为会话密钥与原消息进行简单异或加密。

Alice 和 Bob 计算秘密共享值与 Joux 三方 DH 协议完全相同，但是 Bob 不一样，他没有私钥 $t$ ，因此需要 PKG 帮助他通过先前经过身份验证的安全通道，计算出 $(g^t)^s = g^{st}$ 给 Bob ，正常 Joux 协议里 Bob 计算 $e(g^r,g^s)^t$ ，而在 BF-IBE 里 Bob 计算 $e(g^{st}, g^r) = \hat{g}^{rst}$ 。

{: .success}
**Remarks**：从上述分析过程，不难看出 **BF-IBE** 是安全协议的前提是 **Bilinear Diffie-Hellman** ：给定 $g, g^a, g^b, g^c$ ，计算 $e(g,g)^{abc}$ 是困难的。


## 历史轶闻

历史第一个椭圆曲线配对是 Weil 配对，名字取自数学家 **André Weil** ，他在第二次世界大战期间因拒绝在法国军队服役而被送进监狱，而正是在监狱里，他才有了许多重大的数学成果。于是他在自己的自传中写出了这样一段很有意思的话：

> I’m beginning to think that nothing is more conducive to the abstract sciences than prison... My mathematics work is proceeding beyond my wildest hopes, and I am even a bit worried - if it’s only in prison that I work so well, will I have to arrange to spend two or three months locked up every year?


**Weil 觉得数学家最好的研究场所是监狱**，每年都想去监狱中待几个月做数学研究，此后 Weil 甚至还考虑是否应该向有关当局建议每个数学家在监狱里呆一段时间。现实就是如此魔幻，你永远不知道一个天才数学家的想法有多么"离经叛道"。


## 参考文献

部分参考文献如下

- [Intro to Bilinear Maps](https://people.csail.mit.edu/alinush/6.857-spring-2015/papers/bilinear-maps.pdf) ：这是本文的主要参考文献，博客逻辑行文与这个 slides 一致。
- [Pairings or bilinear maps](https://alinush.github.io/2022/12/31/pairings-or-bilinear-maps.html) ：这篇博客介绍了 pairing 的历史发展，以及它在构造简洁零知识证明协议里面的应用。
- [Pairings for beginners](https://static1.squarespace.com/static/5fdbb09f31d71c1227082339/t/5ff394720493bd28278889c6/1609798774687/PairingsForBeginners.pdf) ：这篇文献介绍了 pairing 背后的数学，以及椭圆曲线配对的详细技术细节，这是前两篇文献里面没有的，比较硬核。
