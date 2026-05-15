---
tags: Isogeny SIDH ECC Post-Quantum-Cryptography
title: "SIDH: Supersingular Isogeny Key Exchange"
key: intro-to-sidh
lang: zh
published: true
---

{: .info}
**概要:** 介绍 Supersingular Isogeny Key Exchange 的核心：超奇异椭圆曲线、 J-invariant 和 Isogeny，最后介绍标准的 SIDH 协议。本文是对 [Supersingular isogeny key exchange for beginners](https://eprint.iacr.org/2019/1321.pdf) 原文的一份笔记式整理/翻译，原文更适合入门阅读。

<!--more-->

{: .error}
**说明:** 基于椭圆曲线同源的密码方案曾经是 NIST 后量子密码标准化过程中一个很有希望的方向。NIST 在第二轮状态报告中将 SIKE 列入进入第三轮的 Alternate Candidate，之后在第四轮中也继续保留过 SIKE 这一候选。但 2022 年 Castryck 与 Decru 给出了对原始 SIDH 的高效密钥恢复攻击，传统 SIDH 今天已经不应再被视为可直接部署的安全方案。但是它的设计理念和数学结构仍然非常有启发性，尤其是对于理解基于 isogeny 的密码学构造，以及后续一些改进版本的设计思路，都具有重要的参考价值。

<div class="success-block" markdown="1">
<div class="block-title">相关链接</div>
- NIST PQC：<https://csrc.nist.gov/Projects/pqc-dig-sig>
- Castryck-Decru 攻击论文：<https://eprint.iacr.org/2022/975.pdf>
- Supersingular isogeny key exchange for beginners: <https://eprint.iacr.org/2019/1321.pdf>
</div>

> 从此篇博客开始，本站点将使用 Agent（例如 Codex） 以及自定义的 [博客 skill](https://github.com/IcingMoon/icingmoon.github.io/tree/master/skill) 来辅助博客发布，包括将本地的 Markdown 笔记进行自动转换和内容润色。此后也可能会在后续的博客中使用 Agent 来辅助生成部分内容，AI 生成的内容会明确声明。

---

## 背景知识

### 超奇异椭圆曲线

考虑定义在有限域 $$K= \mathbb{F}_q$$ 上的椭圆曲线 $$E$$，其 Weierstrass 方程为：

$$
E: y^2 = x^3 + ax + b \quad  a, b \in K
$$

{% definition title="Supersingular Elliptic Curve" %}
超奇异椭圆曲线是具有特殊性质的椭圆曲线，在有限域上定义时，它们的端子态数（Endomorphism Ring）是最大可能的。具体来说，等价于下面（任意一个）条件：

1. 椭圆曲线 $$E$$ 的 Frobenius Trace 记为 $$t$$，其 满足 $$t \equiv 0 \mod p$$。
2. 椭圆曲线 $$E$$ 的自同态环 $$End(E)$$ 是一个秩为 4 的模数环。
3. 椭圆曲线 $$E$$ 的 Hasse 不变量 $$a_p$$ 为 0。
4. $$\mathbb{F}_p$$ 上的椭圆曲线 $$E$$ 是 supersingular 的，当且仅当它与定义在 $$\mathbb{F}_{p^2}$$ 上的某条椭圆曲线同构。
{% enddefinition %}

超奇异椭圆曲线之间的同源具有丰富的结构，也是 SIDH 一类协议的基础。由于这类曲线的 Frobenius Trace 等于 0，则其阶为：$$\vert E(\mathbb{F}_p) \vert = p + 1$$，在更一般的扩域上，我们有 $$\vert E(\mathbb{F}_{p^2}) \vert = k(p + 1)$$，其中 $$k$$ 通常为 $$p+1$$。

### $j$-不变量

在椭圆曲线理论中，$$j$$-不变量（$$j$$-invariant）是一个重要的不变量，用于分类椭圆曲线。唯一标识一个椭圆曲线群同构类的值是 j-invariant。容易想象，椭圆曲线经过简单的平移或旋转之后，并不会改变其几何本质，因此曲线 $$E$$ 和其经过简单几何变换得到的 $$E^\prime$$ 是同构的，对应有限域上的点群也同构。能够唯一标识曲线同构类的代数量，就是 j-invariant。

正式代数定义如下。考虑曲线 $$E: y^2 = x^3 + ax + b \quad  a, b \in K$$，其 j-invariant 为：

$$
j(E) = 1728 \cdot \frac{4a^3}{4a^3 + 27b^2}
$$

{% remark title="j-不变量的性质" %}

- 两条椭圆曲线同构当且仅当它们的 $j$-不变量相同。
- 对于 $$p = 3 \mod 4$$，在有限域 $$\mathbb{F}_{p^2} = \mathbb{F}_{p}(i)$$ 中，其中 $$i^2 + 1 = 0$$，超奇异曲线一共有 $$\lfloor p/12 \rfloor + z$$ 类，其中 $$z \in \{0,1,2\}$$ 类，它的值与 $$p \mod 12$$ 有关。
- 特征为 $$p$$ 的有限域上的超奇异椭圆曲线，其 $j$-invariant 总是落在 $$\mathbb{F}_{p^2}$$ 上。因此讨论 supersingular 曲线时，转到 $$\mathbb{F}_{p^2}$$ 上通常是自然的。

{% endremark %}

## 同源（Isogeny）

> 同源（Isogeny）是一类特殊映射，可以把一条椭圆曲线映射到另一条椭圆曲线。 $$j$$-不变量相同的曲线之间存在同构映射，而更一般的同源映射则连接了不同 $$j$$-不变量的曲线。

一般而言，这样的映射可以写成 $$(x,y) \mapsto  (f(x,y), g(x,y))$$。很多时候我们只写 $$x$$ 坐标上的部分，因为 $$y$$ 坐标的变化可以从 $$x$$ 的变化推导出来。具体而言即 $(x,y) \mapsto  (f(x), c \cdot f^\prime(x))$ ，其中 $c$ 是一个常数值。下面我们介绍非常常见的倍点映射，也是与同源密切相关的一个重要例子。

### 倍点映射

记 $$E_a: y^2 = x^3 + ax^2 + x$$，考虑最简单的自同态映射二倍点乘：

$$
\text { [2]: } \quad E_a \rightarrow E_a, \quad x \mapsto \frac{\left(x^2-1\right)^2}{4 x\left(x^2+a x+1\right)}
$$

显然这不是一个同构，因为存在若干点使得上述映射的分母等于 0，即 $$(0,0), (\alpha, 0), (1/\alpha , 0)$$，其中 $$\alpha ^ 2 + a \alpha + 1 = 0$$。换句话说，所有阶为 2 的点以及无穷远点 $$\mathcal{O}$$ 都会映射到 $$\mathcal{O}$$。这四个元素构成二倍点映射的核（kernel），且满足：

$$
\operatorname{ker}([2]) \cong \mathbb{Z}_2 \times \mathbb{Z}_2
$$

其中三个非平凡元素恰好对应 3 个 2-torsion 子群的生成元。

同理对于三倍点乘映射：

$$
\text { [3]: } \quad E_a \rightarrow E_a, \quad x \mapsto \frac{x\left(x^4-6 x^2-4 a x^3-3\right)^2}{\left(3 x^4+4 a x^3+6 x^2-1\right)^2}
$$

存在 4 个点使得上述映射的分母等于 0，记它们的 $$x$$ 坐标为 $$\beta, \delta, \zeta, \theta$$。这些坐标对应的 8 个点，再加上无穷远点 $$\mathcal{O}$$，一起构成三倍点映射的核空间，满足：

$$
\operatorname{ker}([3]) \cong \mathbb{Z}_3 \times \mathbb{Z}_3
$$

即 3-torsion 恰好由 4 个 3 阶循环子群组成。

{% include figure.html src="/assets/images/260414-intro-to-sidh/image-20240526171412766.png" alt="3-torsion 示例图" width="95%" caption="2-torsion 与 3-torsion 的几何直观" %}

更一般地，对于所有满足 $$\ell \nmid p$$ 的倍点映射，$$\ell$$-torsion 都满足：

$$
\operatorname{ker}([\ell]) \cong \mathbb{Z}_{\ell} \times \mathbb{Z}_{\ell}
$$

上面的二倍点和三倍点映射，其实都可以看作更一般的 isogeny 的特殊情况。

### 同源映射

{% definition title="Isogeny" %}
同源（Isogeny）是一个从椭圆曲线 $$E$$ 到另一椭圆曲线 $$E^{\prime}$$ 的非平凡态射，并且它是群同态。也就是说，对所有 $$P, Q \in E$$，有：

$$
\phi(P+Q)=\phi(P)+\phi(Q)
$$

同时，$$\phi$$ 可以用有理函数来表示，如果 $$\phi: E \rightarrow E^{\prime}$$ 是同源，则存在有理函数 $$\phi_x(x, y)$$ 和 $$\phi_y(x, y)$$，使得：

$$
\phi(x, y)=\left(\phi_x(x, y), \phi_y(x, y)\right)
$$

{% enddefinition %}


同源的基本性质包括：

1. **核（Kernel）**：同源的核是映射到零点的那些点的集合。
2. **度（Degree）**：同源的度是函数域扩张的次数。度为 $$n$$ 的同源称为 $$n$$-同源。
3. **复合**：如果 $$\phi: E \rightarrow E^{\prime}$$ 和 $$\psi: E^{\prime} \rightarrow E^{\prime \prime}$$ 是同源，则 $$\psi \circ \phi$$ 也是同源。

记核为 $$G$$，则通常也把像曲线记为 $$E^\prime = E/G$$。值得注意的是，椭圆曲线同源与其核 $$G$$ 一一对应。给定一个核 $$G$$，我们都可以构造对应的同源映射；其显式构造可以参考 Vélu Formulas。这部分证明非常数学，细节可以参考：

- MIT Elliptic Curves: <https://math.mit.edu/classes/18.783/2023/LectureSlides5.pdf>
- Vélu's Formulas for SIDH: <https://www.mariascrs.com/2020/11/07/velus-formulas.html>


### 同源示例

以二倍点映射为例，选取 $$G=\{\mathcal{O},(\alpha, 0)\}$$ 和 $$E_a$$。根据 Vélu 公式，可以得到：

$$
\phi: \quad E_a \rightarrow E_{a^{\prime}}, \quad x \mapsto \frac{x(\alpha x-1)}{x-\alpha}
$$

其中

$$
a^{\prime}=2\left(1-2 \alpha^2\right)
$$

以 $$\mathbb{F}_{431^2}$$ 上的具体曲线为例：

$$
E_a: y^2=x^3+(208 i+161) x^2+x, \quad \text { with } \quad j\left(E_a\right)=364 i+304
$$

其中 $$(\alpha, 0) \in E_a$$，且 $$\alpha=350 i+68$$。代入上面的 2-isogeny，可以得到新的曲线：

$$
E_{a^{\prime}}: y^2=x^3+(102 i+423) x^2+x, \quad \text { with } \quad j\left(E_{a^{\prime}}\right)=344 i+190
$$

对应的映射为：

$$
\phi: x \mapsto \frac{x((350 i+68) x-1)}{x-(350 i+68)}
$$

同理，以三倍点映射为例，令 $$G=\{\mathcal{O},(\beta, \gamma),(\beta,-\gamma)\}$$。根据 Vélu 公式，有：

$$
\phi: \quad E_a \rightarrow E_{a^{\prime}}, \quad x \mapsto \frac{x(\beta x-1)^2}{(x-\beta)^2}
$$

其中

$$
a^{\prime}=\left(a \beta-6 \beta^2+6\right) \beta
$$

如果点 $$(\beta, \gamma)=(321 i+56,303 i+174)$$ 在曲线 $$E_a: y^2=x^3+(208 i+161) x^2+x$$ 上的阶恰好为 3，则可以得到一个具体的 3-isogeny，其 codomain 为：

$$
E_{a^{\prime}}: y^2=x^3+415 x^2+x, \quad \text { with } \quad j\left(E_{a^{\prime}}\right)=189
$$

同源映射函数为：

$$
\phi: x \mapsto \frac{x((321 i+56) x-1)^2}{(x-(321 i+56))^2}
$$

与只保留 j-invariant 的同构不同，这里的同源会把曲线送到另一条不同 j-invariant 的曲线上，因此两条曲线不再同构，而是同源（isogenous）。

### 代数性质

记 $$\phi: E \mapsto E^\prime$$ 为一个同源，其核（kernel）为 $$G$$，度为 $$d = \vert G \vert $$。

{% remark title="同源的基本性质" %}
- 非零可分同源的度等于其 kernel 的大小。
- 同源一般会改变曲线的 j-invariant。
- 同构是一种特殊的同源，此时核为 $$G=\{\mathcal{O}\}$$。
- 同源一般不可逆；通常不存在真正意义上的逆映射 $$\phi^{-1}$$。
{% endremark %}

{% definition title="对偶同源（Dual Isogeny）" %}
如果 $$\phi: E \mapsto E^\prime$$ 的度数为 $$d$$，则其对偶映射 $$\hat \phi$$ 满足：

$$
\hat \phi \circ  \phi = [d]_E \text{ and } \phi \circ \hat \phi = [d]_{E^\prime}
$$

其中 $[d]_E$ 代表 $$E$$ 上的 $$d$$ 倍点映射，以及 $$[d]_{E^\prime}$$ 代表 $$E^\prime$$ 上的 $$d$$ 倍点映射。
{% enddefinition %}

> 对偶同源可以看作“某种意义上的逆”，但它的复合结果不是恒等映射，而是倍点映射。


{% plain warning title="同源映射下的点阶" %}

1. 一个度为 $$d$$ 的同源 $$\phi: E \mapsto E^\prime$$，可能会让 $$P \in E$$ 的像点 $$\phi(P)$$ 的阶降低一个因子 $$k \mid d$$。
2. 若点 $$P$$ 的阶为 $$\ell$$，且 $$\gcd(\ell, d) = 1$$，则经过一个 $$d$$-isogeny 后点的阶保持不变。
3. 特别地，$$\phi(P)=\mathcal{O}$$ 当且仅当 $P$ 是 $$\phi$$ 的 kernel，即 $$P \in G$$。
4. 有限域 $$\mathbb{F}_q$$ 上的两条曲线同源，当且仅当它们的点数相同。

{% endplain %}


上述第四个结论对 supersingular 曲线而言尤其重要。对于定义在 $$\mathbb{F}_{p^2}$$ 上的超奇异曲线，通常都有：

$$
\vert E(\mathbb{F}_{p^2}) \vert = (p + 1)^2
$$

因此可以得出一个非常关键的结论，所有的超奇异椭圆曲线都是同源的。以 $$\mathbb{F}_{431^2}$$ 上的一条具体曲线为例：

$$
E_a: y^2=x^3+(208 i+161) x^2+x, \quad \text { with } \quad j\left(E_a\right)=364 i+304
$$

其阶满足 $$\#E(\mathbb{F}_{431^2}) = 432^2$$，群结构为：

$$
\mathbb{Z}_{432} \times \mathbb{Z}_{432}
$$

并且这条曲线满足：

$$
ker([p+1]) \cong \mathbb{Z}_{p + 1} \times \mathbb{Z}_{p +1}
$$

从而有：

$$
E(\mathbb{F}_{p^2}) \cong \mathbb{Z}_{p + 1} \times \mathbb{Z}_{p + 1}
$$

{% plain error title="为什么同源曲线的阶相同？" %}
一个容易困惑的地方是：在二倍点同源中，显然有多个点会被映射到 $$\mathcal{O}$$，那么为什么两边曲线的阶还能相同？原文给出的解释是，这种“损失”会通过更高扩域中的点来平衡，因此最终同源曲线的点数保持一致。
{% endplain %}

### 同源图

以 $$\mathbb{F}_{431^2}$$ 上所有超奇异曲线的 j-invariant 构成的图为例，可以得到如下的 supersingular isogeny graph（共 37 类超奇异同源曲线）：

{% include figure.html src="/assets/images/260414-intro-to-sidh/image-20240526192503339.png" alt="超奇异同源图" width="95%" caption="$\mathbb{F}_{431^2}$ 上的 supersingular isogeny graph" %}

由于同源保持曲线阶不变，因此超奇异曲线在进行同源后，仍然会落到超奇异曲线集合中。于是当我们在这张图上做 $$\ell$$-isogeny 时，本质上就是在图上进行随机游走。

从这个角度看，SIDH 已经和传统 DH 有了某种相似性：Alice 和 Bob 从同一个起点出发，分别按照自己的私钥选择图上的路径，最后再利用对方公开出来的信息继续走向一个共同的终点。

对于每一条曲线 $$E$$，存在 3 个不同的 2-isogeny，因此理论上它最多可以通过 2-isogeny 到达 3 条不同 j-invariant 的曲线。于是我们得到如下结构：

{% include figure.html src="/assets/images/260414-intro-to-sidh/image-20240526194828612.png" alt="2-isogeny graph" width="95%" caption="2-isogeny 的局部图结构" %}

除了 j-invariant 值为 $$0, 4, 242$$ 的曲线外，其他所有顶点都有 3 条出边。而且这里的边默认都是双向的，因为对应同源 $$\phi: E \mapsto E^\prime$$ 的对偶同源 $$\hat \phi: E^\prime \mapsto E$$ 会提供返回的边。

同理，对于 3-isogeny 图，每个顶点会有 4 条出边：

{% include figure.html src="/assets/images/260414-intro-to-sidh/image-20240526195409855.png" alt="3-isogeny graph" width="95%" caption="3-isogeny 的局部图结构" %}

有了这种图论直觉后，我们再看 SIDH 中有限域的选取。SIKE/SIDH 的标准选择是下面形式的素数：

$$
p = 2^{e_A}3^{e_B} - 1
$$

其中 $$2^{e_A} \approx 3^{e_B}$$。更一般地，SIDH 也适用于 $$p = f2^{e_A}3^{e_B} - 1$$ 的形式，但很多标准设置里直接取 $$f = 1$$。由于：

$$
E\left(\mathbb{F}_{p^2}\right) \cong \mathbb{Z}_{(2^{e_A} 3^{e_B})} \times \mathbb{Z}_{2^{e_A} 3^{e_B}}
$$

因此存在两个点 $$P, Q$$，它们的阶为 $$p_s = 2^{e_A}3^{e_B}$$，并构成整个椭圆曲线群的基。所有阶为 $$2^{e_A}$$ 或 $$3^{e_B}$$ 的点也都落在 $$E\left(\mathbb{F}_{p^2}\right)$$ 上。
这也是为什么 SIDH 可以分别在 2-power 和 3-power torsion 上工作，并把 Alice 与 Bob 的计算放在同一条起始曲线中完成。选择 $$\ell = 2, 3$$ 还有一个非常现实的原因：这两类小度同源都可以在 $$\mathbb{F}_{p^2}$$ 上高效计算；如果选择更高阶的同源，通常就需要进入更大的扩域。

## SIDH Protocol

有了上面的 supersingular isogeny graph 直觉之后，SIDH 的整体轮廓就已经比较清楚了。不过，在给出完整协议之前，先看一个“看起来像 DH、但其实不对”的朴素版本，会更容易理解真实 SIDH 为什么要引入辅助点。

### 朴素 SIDH

参考传统 DH 协议，一个最自然的想法是：选择私钥 $$s_a \in (0, 2^{e_A})$$ 与 $$s_b \in (0, 3^{e_B})$$，然后让 Alice 和 Bob 分别按自己的私钥在图上走若干步。

{% plain info title="朴素方案" %}
Alice 的公钥生成可以粗略理解为：

- 根据 $$s_a$$ 的第 1 个比特选择一个 2-isogeny，记为 $$\phi_{a_1}$$，得到新的曲线 $$E_{a_1} = \phi_{a_1}(E_{a_0})$$。
- 第 $$i$$ 轮，根据第 $$i$$ 个比特在 $$E_{a_{i-1}}$$ 上继续选择一个 2-isogeny，记为 $$\phi_{a_i}$$。

经过 $$e_A$$ 次 2-isogeny 后，Alice 到达曲线 $$E_a$$。

Bob 同理，通过 $$e_B$$ 次 3-isogeny 到达曲线 $$E_b$$。

于是一个朴素的共享秘密想法是：

- Alice 拿到 $$E_b$$ 后，再按自己的私钥继续走 $$e_A$$ 步 2-isogeny，得到 $$E_{ba}$$。
- Bob 拿到 $$E_a$$ 后，再按自己的私钥继续走 $$e_B$$ 步 3-isogeny，得到 $$E_{ab}$$。

{% endplain %}

{% plain error title="方案分析" %}
这个方案是错误的，错误的关键原因有两个：

1. 同源群不是交换群，因此通常有 $$j(E_{ba}) \ne j(E_{ab})$$，无法得到共享秘密。
2. 进行 2-isogeny 或 3-isogeny 时，在每一步其实都存在多个 kernel 选择，因此“私钥”并不只是一个简单整数，而是包含了更多关于子群的信息。

更直观一点说，isogeny 本质上是图上的随机游走。先执行策略 $$s_1$$ 再执行策略 $$s_2$$，和先执行 $$s_2$$ 再执行 $$s_1$$，最终到达的终点一般不同。真正 SIDH 的关键，在于引入辅助点信息，使得双方最终构造出的复合同源拥有同一个 kernel，从而得到同一个共享 j-invariant。

{% endplain %}

### 标准 SIDH

设素数 $$p = 2^{e_A}3^{e_B} - 1$$，并固定一条初始超奇异椭圆曲线 $$E$$。下面给出更接近真实协议的版本。

{% plain info %}


- **公开辅助点**

  由于 $$\ell$$-torsion 具有 $$\mathbb{Z}_{\ell} \times \mathbb{Z}_{\ell}$$ 的二维结构，因此 Alice 选取：

  $$
  \left\langle P_A, Q_A\right\rangle=E\left[2^{e_A}\right] \cong \mathbb{Z}_{2^{e_A}} \times \mathbb{Z}_{2^{e_A}}
  $$

  其中 $$P_A, Q_A$$ 的阶都为 $$2^{e_A}$$。它们的线性组合可以生成一个大小为 $$2^{2e_A}$$ 的子群。

  Bob 同理选取：

  $$
  \left\langle P_B, Q_B\right\rangle=E\left[3^{e_B}\right] \cong \mathbb{Z}_{3^{e_B}} \times \mathbb{Z}_{3^{e_B}}
  $$

  其中 $$P_B, Q_B$$ 的阶为 $$3^{e_B}$$。

- **公钥生成**

  - Alice 随机采样私钥 $$k_A \in [0, 2^{e_A})$$，计算

    $$
    S_A=P_A+\left[k_A\right] Q_A \quad \text { with } \quad k_A \in\left[0,2^{e_A}\right)
    $$

    根据 $$S_A$$ 生成 $$e_A$$ 个 2-isogeny，得到复合同源 $$\phi_A: E \mapsto E_A$$，记为 $$E_A = E /\left\langle S_A\right\rangle$$。然后把 Bob 的基点也映射过去，得到 $$P_B^\prime, Q_B^\prime$$，于是 Alice 的公钥为

    $$
    \mathrm{PK}_A=\left(E_A, P_B^{\prime}, Q_B^{\prime}\right)=\left(\phi_A(E), \phi_A\left(P_B\right), \phi_A\left(Q_B\right)\right)
    $$

  - Bob 随机采样私钥 $$k_B \in [0, 3^{e_B})$$，计算

    $$
    S_B=P_B+\left[k_B\right] Q_B \quad \text { with } \quad k_B \in\left[0,3^{e_B}\right)
    $$

    根据 $$S_B$$ 生成 $$e_B$$ 个 3-isogeny，得到 $$\phi_B: E \mapsto E_B$$，记为 $$E_B = E /\left\langle S_B\right\rangle$$。然后把 Alice 的基点映射过去，得到 $$P_A^\prime, Q_A^\prime$$，于是 Bob 的公钥为

    $$
    \mathrm{PK}_B=\left(E_B, P_A^{\prime}, Q_A^{\prime}\right)=\left(\phi_B(E), \phi_B\left(P_A\right), \phi_B\left(Q_A\right)\right)
    $$

- **秘密共享值计算**

  - Alice 收到 Bob 的公钥后，在 $$E_B$$ 上计算

    $$
    S_A^\prime = P_A^\prime + [k_A] Q_A^\prime
    $$

    从而得到秘密同源 $$\phi_A^\prime : E_B \mapsto E_{AB}$$，其中

    $$
    E_{AB} = E_B/\left\langle S_A^\prime\right\rangle
    $$

    最终共享值取为 $$j_{AB} = j(E_{AB})$$。

  - Bob 同理，在 $$E_A$$ 上计算

    $$
    S_B^\prime = P_B^\prime + [k_B] Q_B^\prime
    $$

    得到秘密同源 $$\phi_B^\prime : E_A \mapsto E_{BA}$$，最终共享值为 $$j_{BA} = j(E_{BA})$$。
{% endplain %}



{% plain error title="同源构造细节" %}

如何从一个阶为 $$2^{e_A}$$ 的点，分解出 $$e_A$$ 个 2-isogeny？这个问题和 isogeny 对点阶的影响直接相关。记 $$E_0 = E$$，$$S_0 = S_A$$，其中 $$S_0$$ 的阶为 $$2^{e_A}$$。则：

$$
R_0 = S_0^{2^{e_A - 1}}
$$

是 $$E_0$$ 上一个阶为 2 的点，因此可以作为第一步 2-isogeny 的 kernel。记第一步同源为 $$\phi_1$$，则得到新的曲线 $$E_1$$ 和新的点 $$S_1 = \phi_1(S_0)$$。此时 $$S_1$$ 在 $$E_1$$ 上的阶会降为 $$2^{e_A - 1}$$。归纳如下。第 $$i$$ 轮时，$$S_{i-1}$$ 的阶为 $$2^{e_A - i + 1}$$，则计算：

$$
R_i = S_i^{2^{e_A - i}}
$$

即可得到下一步 2-isogeny 的 kernel。重复这个过程共 $$e_A$$ 轮，最终 $$S_{e_A} = \mathcal{O}$$。

对 Bob 的 3-isogeny 过程同理，只不过 kernel 需要由两个非零元构成，因此会取 $$R_i$$ 与其逆元 $$-R_i$$ 一起生成核。

{% endplain %}

### SIDH 的正确性
SIDH 抽象到几何/图论上有着很明确的意义：即有向图的随机游走，从起点到终点的过程其实就是群作用(group action)，具体而言就是同源 isogeny，而同源的度决定了该随机游走的复杂性，即从某个确定的起点出发，不同的终点数目最大有多少。按照上述方式构造后，双方最终得到的曲线满足 $$j(E_{AB}) = j(E_{BA})$$，它们都对应于同一个类曲线 $$ E /\left\langle S_A, S_B\right\rangle$$。更严格的证明可以在论文 [pqc from supersingular elliptic curve isogenies](https://eprint.iacr.org/2011/506.pdf) 中找到。其核心等式是：

$$
E /\left\langle P, Q\right\rangle  \cong (E/\left\langle P\right\rangle) / \phi(Q)
$$

其中 $$\phi = E/ \left\langle P \right\rangle$$。


SIDH 选择的同源度数形如 $$p^e$$。当 $$p$$ 很小时，这类同源可以在多项式时间内计算，复杂度近似为 $$O(ep)$$。这也是为什么协议特别偏爱 $$2$$ 和 $$3$$ 这两个小素数。对于比较大的素数阶 $p$ 的同源，目前计算同源的最优复杂度是 $O(\sqrt{p})$ （参考 [velusqrt](https://velusqrt.isogeny.org/velusqrt-20200616.pdf)）。相比之下，更大素数阶的同源目前计算代价会明显更高。

下面从 kernel 的角度，解释为什么 SIDH 最终一定会得到相同的 j-invariant。

{% proof fold title="SIDH 正确性证明" %}

考虑 Alice 的同源 $$\phi_A$$，其 kernel 实际上就是 $$P_A + [k_A] Q_A$$，因此：

$$
P_A + [k_A] Q_A \stackrel{\phi_{A}}{\mapsto} \mathcal{O}
$$

Alice 公开的辅助点满足：

$$
P_B^\prime:= \phi_A (P_B)
$$

$$
Q_B^\prime:= \phi_A (Q_B)
$$

同理，Bob 的同源 $$\phi_B$$ 的 kernel 是 $$P_B + [k_B] Q_B$$，满足：

$$
P_B + [k_B] Q_B \stackrel{\phi_{B}}{\mapsto} \mathcal{O}
$$

Bob 公开的辅助点满足：

$$
P_A^\prime:= \phi_B (P_A)
$$

$$
Q_A^\prime:= \phi_B (Q_A)
$$

于是 Alice 最终在 $$E_B$$ 上以 $$P_A^{\prime} + [k_A] Q_A^{\prime}$$ 为核计算新的同源，记为 $$\phi_A^\prime$$。其复合同源为：

$$
\phi_{AB}: E \stackrel{\phi_{B}}{\mapsto} E_B  \stackrel{\phi_{A}^{\prime}}{\mapsto} E_{AB}
$$

即

$$
\phi_{AB} = \phi_{A}^{\prime} \circ \phi_{B}
$$

根据 kernel 与群同态的性质，有：

$$
\begin{aligned}
\phi_{AB}(P_A + [k_A] Q_A) &= \phi_{A}^{\prime} \circ \phi_{B} (P_A + [k_A] Q_A) \\
&=  \phi_{A}^{\prime}( \phi_{B} (P_A) + [k_A]\phi_B(Q_A)) \\
&=  \phi_{A}^{\prime}(P_A^{\prime} + [k_A] Q_A^{\prime}) \\
&= \mathcal{O}
\end{aligned}
$$

以及

$$
\begin{aligned}
\phi_{AB}(P_B + [k_B] Q_B) &= \phi_{A}^{\prime} \circ \phi_{B} (P_B + [k_B] Q_B) \\
&=  \phi_{A}^{\prime}(\mathcal{O}) \\
&= \mathcal{O}
\end{aligned}
$$

因此同源 $$\phi_{AB}$$ 的 kernel 同时包含 $$P_A + [k_A] Q_A$$ 和 $$P_B + [k_B] Q_B$$：

$$
\mathcal{K}({\phi_{AB}}) = 
\left\{
\begin{array}{lr}
P_A + [k_A] Q_A \\
P_B + [k_B] Q_B
\end{array}
\right.
$$

同理，Bob 最终的复合同源为 $$\phi_{BA}$$ 

$$
\phi_{BA}: E \stackrel{\phi_{A}}{\mapsto} E_A  \stackrel{\phi_{B}^{\prime}}{\mapsto} E_{BA}\\
\implies \phi_{AB} = \phi_{B}^{\prime} \circ \phi_{A}
$$

也具有完全相同的 kernel

$$
\mathcal{K}({\phi_{BA}}) = 
\left\{
\begin{array}{lr}
P_A + [k_A] Q_A \\
P_B + [k_B] Q_B
\end{array}
\right.
$$

**当两个同源的 kernel 相同时，它们对应的是同一个群作用。**  因此 SIDH 协议最终会得到同一个等价曲线族，也就是相同的共享 j-invariant。
{% endproof %}
