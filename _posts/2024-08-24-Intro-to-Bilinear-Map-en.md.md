---
tags: Pairing-Based-Cryptography MOV-Attack DDH IBE 
title: Intro to Bilinear Map
key: intro-to-bilinear-map
lang: en
hidden: true
---

{: .info}
**tl;dr:** This article introduces the definition, properties of bilinear maps, and their applications in cryptography such as the MOV attack, single-round three-party DH protocol, and Identity-Based Encryption.

<!--more-->

{: .error}
**Disclaimer:** This article is automatically translated from Chinese based on the open source tool [GPT-Academic](https://github.com/binary-husky/gpt_academic), using the [OpenAI-GPT-4o-mini](https://platform.openai.com/docs/models/gpt-4o-mini) model. If there are any ambiguities or mistakes, please switch to the original Chinese blog.


Bilinear maps establish linear relationships between different groups. Since Boneh and Franklin first applied bilinear map functions in Identity-Based Encryption in 2001, they quickly became a popular research direction in cryptography, holding significant importance in various emerging cryptographic areas, such as zero-knowledge proofs and Pairing-Based Cryptography. Cryptanalysis methods based on bilinear maps (especially elliptic curve groups) feature typical examples like the MOV Attack, which leverages bilinear maps to convert the discrete logarithm problem based on certain pairing-friendly elliptic curves.

## Definition of Bilinear Map

Let $G_1, G_2, G_t$ be cyclic groups of the same order. Without loss of generality, we define the group operation as the multiplication symbol $(\cdot)$.

**Bilinear Map**: Let $e:G_1 \times G_2 \mapsto G_t$ denote a mapping from the direct product group $G_1 \times G_2$ to $G_t$. The mapping $e:G_1 \times G_2 \mapsto G_t$ is called a bilinear map, meaning for any $u \in G_1, v \in G_2, a, b \in \mathbb{Z}$, it satisfies:

$$
e(u^a, v^b) = e(u,v)^{ab} \tag{1}
$$

Notes:

1. Bilinear maps are also referred to as **Pairing**, as they associate pairs of elements from $G_1$ and $G_2$ with elements in $G_t$.
2. In fact, the group operation symbol could be arbitrary. For instance, if both are additive groups $(+)$, we denote $[a]P = \underbrace{P + \cdots + P}_{a}$, then the bilinear map condition can be denoted as $e([a]u, [b]v) = [ab]e(u,v)$. The most commonly used pairing is the elliptic curve additive group $G_1 = G_2 = E$ to the finite field multiplicative group $G_t = \mathbb{F}_q$, that is $e([a]u, [b]v) = e(u,v)^{ab}$. Mathematically, they are essentially the same, and for convenience, this paper will subsequently use the multiplicative group representation.
3. More generally, the definition of bilinear mappings can be decomposed such that for any $x_1, x_2 \in G_1, y_1, y_2 \in G_2, c \in \mathbb{Z}$, it holds that:
   1. Linearity one: $e(x_1 \cdot x_2,y) = e(x_1,y) \cdot e(x_2, y)$
   2. Linearity two: $e(x,y_1 \cdot y_2) = e(x,y_1) \cdot e(x, y_2)$
   3. Linearity three: $e(x^c,y) = e(x,y)^c = e(x, y^c)$

Notice that the above definition allows for all element pairs to be mapped to the identity element $1$ in $G_t$, thus a trivial mapping $e : \forall u \in G_{1}, \forall v \in u, e(u,v) = 1$ is also a bilinear map, but such a trivial bilinear map has no research significance in cryptography. The focus in cryptography should be on **non-trivial, computable bilinear maps.**

{: .error}
**Admissible Bilinear Map**
Let $e:G_1 \times G_2 \mapsto G_t$ be a bilinear map, and denote $g_1, g_2$ as generators of groups $G_1, G_2$, respectively. If $e(g_1,g_2)$ generates $G_t$ and $e$ is efficiently computable (e.g., within polynomial time), the mapping $e$ is termed an admissible bilinear map. 
These are the bilinear maps of primary interest to us. Sometimes such mappings are represented as $\hat{e}$. This paper continues to use $e$, and from now on, when mentioning bilinear maps, we implicitly refer to admissible bilinear maps.

### About Groups $G_1, G_2, G_t$

Selection and properties of groups $G_1, G_2, G_t$ in bilinear maps:

- **Isomorphism**: $G_1, G_2, G_t$ are all isomorphic to each other as they share the same order and are cyclic groups. (Note that finding computable isomorphic mappings can be difficult, especially when the order of the groups is particularly large.)
- **Diversity**: In some sense, they (can) be different groups because we express elements in different ways, and the group operations are not identical.
- Generally, in bilinear maps, $G_1 = G_2$. From now on, unless otherwise specified, we denote both as $G = G_1 = G_2$. The order of group $G$ can be composite or prime (most cases).
- **Self-bilinear map**: If $G = G_t$, it is called a self-bilinear map, which represents an Open Problem: how to construct a self-bilinear map.

&nbsp;

Common bilinear maps typically map from the elliptic curve additive group over finite fields $E : y^2 = x^3 + ax + b \mod p$ to finite fields $\mathbb{F}_{q^k}$. Specifically:

- Source group $G$: Typically selected from specific elliptic curve groups (or their subgroups): supersingular curves, MNT curves, etc.
- Target group $G_t$: Usually a general finite field $\mathbb{F}_{q^k}$.

More generally, $G$ is typically an Abelian variety over some fields, with elliptic curve groups being the most common Abelian varieties over finite fields, having dimension 1.

### Extension: Abelian Variety

{: .warning}
Some content in this section was generated by the ChatGPT-4o model and is for reference only.

Abelian variety is an important concept in algebraic geometry, **it is a complete algebraic variety over some field, possessing a group structure, and the group operation is commutative (i.e., it satisfies the commutative law).** It meets the following defining characteristics:

- **Complete**: In algebraic geometry, a variety is called complete if it satisfies a certain form of "closedness" condition, which means that, from a geometric perspective, it has no "edges", similar to compactness in topology. This property ensures the independence of integral paths on the Abelian variety, and is one of the keys to its good algebraic properties.
- **Algebraic Variety**: An Abelian variety is a special kind of algebraic variety that can be defined by the zero sets of algebraic equations over some field. These equations are polynomial equations that define a set of points over the given field. **For example, the elliptic curve equation $y^2 = x^3 + ax + b$.**
- **Group Structure**: Points on an Abelian variety satisfy all the axioms of a group (existence of an identity element, inverses, and satisfying the associative law). The group operation is usually defined geometrically, **for example, the addition of points on an elliptic curve.**
- **Commutativity**: The group operation on an Abelian variety is commutative, which means that for any two points $P$ and $Q$, we have $P + Q = Q + P$.

Readers familiar with the elliptic curve group over finite fields can analogize the above defining characteristics; as the most common Abelian variety, the dimension of the elliptic curve group is 1.

&nbsp;

**The dimension of an Abelian variety** is a fundamental and important concept that describes the "size" of the Abelian variety in terms of its complexity and geometric shape as an algebraic variety. More specifically, the dimension of an Abelian variety refers to its dimension as a smooth manifold (when considered over the complex field) or as an algebraic variety (when considered over any field). This dimension tells us how many dimensions of space the Abelian variety locally resembles. Taking the elliptic curve as an example:

- **From a geometric perspective**, an elliptic curve is a simple linear structure, that is, a one-dimensional Abelian variety. If the manifold of the equation is a plane (for example, in the case of equations with three variables), it is two-dimensional. And so on.
- **From an algebraic perspective**, dimension can be understood as the **number of independent parameters needed to uniquely define a point on the Abelian variety**. For example, a line (such as a straight line or an elliptic curve) is one-dimensional because you can use a single parameter (such as the coordinates of the points on the curve) to describe every point on the line. Similarly, a plane or surface is two-dimensional because describing points on the plane or surface requires two parameters. For elliptic curves over finite fields, given an $x$ coordinate, it corresponds to at most two points $(x,y), (x,-y)$ (the number of quadratic residues over finite fields), which are simply mutually reciprocal pairs, and their algebraic properties are nearly identical.

Currently commonly used Abelian varieties in cryptography include:

1. **Elliptic Curves**: The simplest one-dimensional Abelian variety, elliptic curves have wide applications in number theory and cryptography.
2. **Jacobian Varieties**: Given a smooth projective curve, its Jacobian variety is an associated Abelian variety that parameterizes the divisor classes on the curve. (For example, the Jacobian of a hyperelliptic curve's divisor class group).

### Common Bilinear Maps

The earliest and most famous bilinear maps are the Weil Pairing and the Tate Pairing, and later optimized pairing algorithms based on them have emerged, all of which **are based on the bilinear mappings of elliptic curves.**

1. **Weil Pairing**: The Weil pairing is a bilinear map defined on elliptic curves. It is one of the first types of pairing used in pairing-based cryptography, with high computational complexity.
2. **Tate Pairing**: The Tate pairing is a bilinear mapping that offers greater computational efficiency relative to the Weil pairing.
3. **Ate Pairing**: The Ate pairing is an improvement upon the Tate pairing, aimed at further increasing computational efficiency.
4. **Barreto-Naehrig (BN) Pairing**: The BN pairing is a special type of pairing defined on a specific type of elliptic curve known as Barreto-Naehrig curves.

All these bilinear maps involve very complex mathematical principles and have a relatively high computational cost. However, regarding the application of bilinear maps in cryptography, *there is no need to understand and construct them to use them*, meaning that one does not need to understand the construction principles. As methods and tools for analysis, bilinear pairings find wide applications in cryptography. (Of course, how to construct better bilinear pairings and accelerate pairing computations is also a hot research direction.)

## Bilinear Map Cryptanalysis

As mentioned earlier, bilinear mappings can be applied in the design of zero-knowledge proof protocols, MOV attacks, etc. This section introduces the direct applications of bilinear mappings in cryptanalysis, mainly including: DDH problem solving and MOV reduction.

### Decisional Diffie-Hellman

To understand bilinear mappings, it is essential to grasp their influence on the Decisional Diffie-Hellman (DDH) problem. First, let's review the DH protocol. Suppose Alice and Bob want to negotiate a secret key over an insecure channel, they first select a multiplicative group $G$ with a generator $g$ and group order $q$, then:

1. Alice generates a private key $a$ and sends her public key $g^a$ to Bob.
2. Bob generates a private key $b$ and sends his public key $g^b$ to Alice.
3. Alice computes $S = (g^b)^a = g^{ab}$, and Bob computes $S = (g^a)^b = g^{ab}$, hence $S$ is their shared secret value.Given $g, g^a, g^b$, solving for the secret value $g^{ab}$ is difficult and is referred to as the Computational Diffie-Hellman problem (CDH). This is based on the fact that the discrete logarithm problem on $G$ is difficult: given $g, g^a$, solving for the private key $a$ is difficult. The DDH problem is a weakened version, where given $g, g^a, g^b, g^c$, the adversary has to determine whether $g^c$ is the shared secret value produced by the DH protocol $s = g^{ab}$. The formal definition is as follows.

**DDH**: Let $G$ be a multiplicative group with generator $g$ of order $q$. The advantage of a probabilistic algorithm $\mathcal{A}$ in solving the decision Diffie-Hellman problem in $G$ is defined as:

$$
\operatorname{Adv}_{\mathcal{A}, G}^{\mathrm{DDH}}=\left|\mathrm{P}\left[\mathcal{A}\left(g, g^a, g^b, g^{ab}\right)=1\right]-\mathrm{P}\left[\mathcal{A}\left(g, g^a, g^b, g^z\right)=1\right]\right|
$$

where $a, b, z$ are sampled uniformly from $\mathbb{Z}_q$, and the probabilities are derived from $a, b, z$ and the output of $\mathcal{A}$: 1 represents that it is judged to be a DH protocol output, while 0 represents that it is not a DH protocol output.

It is easy to see that when there exists a probabilistic algorithm $\mathcal{A}$ that runs in polynomial time such that $\operatorname{Adv}_{\mathcal{A}, G}^{\mathrm{DDH}} = 1$, it means that the DDH problem can be completely decided in polynomial time.

{:.error}
**Solving DDH with Bilinear Maps**  
If there exists a bilinear map $e:G \times G \mapsto G_t$ (with $G_t$ chosen arbitrarily), then there exists a polynomial-time algorithm $\mathcal{A}$ such that $\operatorname{Adv}_{\mathcal{A}, G}^{\mathrm{DDH}} = 1$. Given $g, g^a, g^b, g^c$, determining whether $g^c = g^{ab}$ is equivalent to determining whether $c \equiv ab \mod q$. According to the definition of the bilinear map, it suffices to determine if $e(g^a, g^b) = e(g, g^c)$. Therefore, the DDH problem can be decided in polynomial time.

**Remarks**
- **XDH Assumption**: If the groups $G_1, G_2$ are different, and there exists a bilinear map $e:G_1 \times G_2 \mapsto G_t$, as long as there is no efficiently computable group isomorphism between $G_1$ and $G_2$, the DDH problem in $G_1$ and $G_2$ may still be difficult. (For example, some MNT Curves)
- **CDH Problem**: If the DDH problem in $G$ is simple, its CDH problem may still be difficult.
- **GDH Group**: A prime order group $G$ is called a Gap Diffie-Hellman (GDH) group if its CDH problem is difficult, while the DDH problem is solvable.
- **Zero-Knowledge Proofs**: In GDH groups, Alice can prove that she possesses the number $a$ without revealing her private key $a$. This can be achieved through a DDH challenge, perfectly aligning with the scenario of zero-knowledge proofs!

### MOV Reduction

This section considers the discrete logarithm problem in groups when bilinear maps exist.

**Theorem (MOV Reduction)**: Suppose there exists a bilinear map $e:G \times G \mapsto G_t$. Then, the discrete logarithm problem in group $G$ is not harder than the discrete logarithm problem in group $G_t$.

The proof is straightforward. Given $g, g^a \in G$, we can compute $g_t = e(g,g)$ and $y_t = e(g, g^a) = e(g,g)^a = g_{t}^{a} \in G_t$. At this point, we have a set of discrete logarithm problems in group $G_t$: $g_t, y_t = g_t^a$, and the solution is the same as that of the original discrete logarithm problem. This reduction process is known as MOV reduction, and applying it to elliptic curve groups over finite fields leads to the well-known MOV Attack.

First, we introduce the basic concept of the embedding degree on elliptic curves. Given a prime $p$, an elliptic curve defined over the finite field $\mathbb{F}_p$: $E: y^2 = x^3 + ax + b \mod p$, let $\mathcal{O}(E)$ be the order of $E$, and $\hat{E}$ be a prime order subgroup of the group $E$.

**Theorem**: There exists a bilinear map between ${\hat E}$ and $\mathbb{F}_{p^k}$ if and only if $\mathcal{O}({\hat E}) \mid (p^k - 1)$.

1. Sufficient Condition: The condition of bilinear maps requires that the orders of the two subgroups are the same, thus $\mathcal{O}({\hat E}) \mid (p^k - 1)$ must hold.
2. Necessary Condition: This is given by the constructions of the Weil Pairing or the Tate Pairing.

**Embedding Degree**: The minimum $k$ satisfying the above condition is defined as the embedding degree of the elliptic curve $E$. When the embedding degree is relatively low, for instance, $k \le 6$, we refer to it as a pairing-friendly curve.

**MOV Attack**: An attack based on the MOV reduction, given the discrete logarithm problem on an elliptic curve $P, Q=[r]P$:

1. Calculate the embedding degree $k$ of curve $E$.
2. Calculate the bilinear map $e:E \times E \mapsto {\mathbb{F}}_{p^{k}}$.
3. MOV reduction: Choose an arbitrary base point $G$, compute $u = e(P, G), v = e(Q, G) = e([r]P, G) = e(P, G)^r$,
4. We obtain the discrete logarithm problem $u, v = u^r \in \mathbb{F}_{p^{k}}$ and solve for $r$.

MOV Attack based on Sage, from [jvdsn's cryto attack](https://github.com/jvdsn/crypto-attacks/blob/master/attacks/ecc/mov_attack.py): 

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
**Remarks**: The core idea of the MOV attack is to transform the discrete logarithm problem on elliptic curves into a problem solvable in finite fields through bilinear mappings. When the embedding degree $k$ is relatively small, this transformation significantly reduces the difficulty of solving the discrete logarithm. For instance, if $p$ is a 256-bit prime, the discrete logarithm problem on elliptic curves generally provides a security strength of 128 bits. However, for curves with an embedding degree of 2, when transformed to $\mathbb{F}_{p^2}$, the security strength is only about 60 bits.

{: .error}
**MOV Security**: For general secure curves, the embedding degree is extremely large, roughly corresponding to the size of $p$, and in many cases, calculating the embedding degree is infeasible. Even if it is feasible, the discrete logarithm problem over $\mathbb{F}_{p^k}$ will not be simpler than the original elliptic curve group, thereby resisting the MOV attack. The MOV attack must be considered when selecting secure curve parameters.



## Bilinear Map Cryptography Design

The previous section outlined how bilinear mappings have led to a series of new cryptanalysis methods. This section focuses on utilizing bilinear maps for the design of cryptographic systems and protocols. The properties of bilinear mappings have illuminated many previously pending issues while also giving rise to numerous new difficult problems (DH).

### Most Common New Problems

The advent of a new analytical tool inevitably brings about a series of new mathematical difficulties. Several new problems have already been defined and hypothesized in the new bilinear context (all are difficult):- **Bilinear Diffie-Hellman**: Given $g, g^a, g^b, g^c$, compute $e(g,g)^{abc}$. (Similar to the "tripartite" CDH, but spanning two groups)
- **Decisional Bilinear Diffie-Hellman**: Distinguish between $g, g^a, g^b, g^c, e(g,g)^{abc}$ and $g, g^a, g^b, g^c, e(g,g)^{z}$.
- **k-Bilinear Diffie-Hellman Inversion**: Given $g, g^y, g^{y^2}, \cdots, g^{y^k}$, compute $e(g,g)^{\frac{1}{y}}$.
- **k-Decisional Bilinear Diffie-Hellman Inversion**: Distinguish between $g, g^y, g^{y^2}, \cdots, g^{y^k}, e(g,g)^{\frac{1}{y}}$ and $g, g^y, g^{y^2}, \cdots, g^{y^k}, e(g,g)^{z}$.

&nbsp;

Considering bilinear mappings across different groups, that is when $G_1, G_2$ are not the same, we refer to this as the "Co" assumption:

- **Computational Co-Diffie-Hellman**: Given $g_1, g_1^a \in G_1$ and $g_2, g_2^b \in G_2$, compute $g_2^{ab}$.
- **Decisional Co-Diffie-Hellman**: Distinguish between $g_1, g_1^a \in G_1$, $g_2, g_2^b, g_2^{ab} \in G_2$ and $g_1, g_1^a \in G_1$, $g_2, g_2^b, g_2^{z} \in G_2$.
- **Co-Bilinear Diffie-Hellman**: Given $g_1, g_1^a, g_1^b \in G_1$ and $g_2 \in G_2$, compute $e(g_1, g_2)^{ab}$.
- **Decisional Co-Bilinear Diffie-Hellman**: Distinguish between $g_1, g_1^a, g_1^b, g_2, e(g_1, g_2)^{ab}$ and $g_1, g_1^a, g_1^b, g_2, e(g_1, g_2)^{z}$.

Based on bilinear mappings (also known as Pairing), cryptography that relies on these concepts is generally referred to as Pairing-Based Cryptography, most of which is based on the hard problems outlined above.


### One-round 3-party Diffie-Hellman

The first cryptographic protocol designed based on bilinear mappings is a one-round three-party DH protocol, which can be completed through a single round of interaction. The essence of bilinear mapping is to use a kind of "cheating" mechanism to make it appear as if a CDH problem has been solved, namely, $e(g^a, g^b) = c(g,g)^{ab} \in G_t$, but this computational result is in the new group $G_t$. We cannot continue to perform Pairing, and instead have to solve an additional CDH problem. Following this idea, the one-round three-party DH protocol becomes quite trivial.

&nbsp;

**Joux’s 3-Party Diffie-Hellman**: Given a prime-order group $G$ of order $p$, there exists a bilinear mapping $e:G \times G \mapsto G_t$, let $g \in G$ be the generator, denote $\hat{g} = e(g,g) \in G_t$.

1. Alice randomly selects $a \stackrel{R}{\leftarrow} \mathbb{Z}_p$, Bob randomly selects $b \stackrel{R}{\leftarrow} \mathbb{Z}_p$, and Carol randomly selects $c \stackrel{R}{\leftarrow} \mathbb{Z}_p$.
2. Alice, Bob, and Carol broadcast $g^a, g^b, g^c$ respectively.
3. Alice computes $e(g^b, g^c) ^a = \hat{g}^{abc}$, Bob computes $e(g^c, g^a)^b = \hat{g}^{abc}$, and Carol computes $e(g^a, g^b)^c = \hat{g}^{abc}$.

Given $g, g^a, g^b, g^c$, we cannot compute $\hat{g}^{abc}$. A misleading computation such as $e(g^a, e(g^b, g^c)) = e(g^a, \hat{g}^{bc}) = \hat{g}^{abc}$ is not feasible because $\hat{g} \in G_t$ and is not in $G$, and the bilinear mapping $e$ cannot act on $\hat{g}$!

The hard problem assumption on which the above three-party DH protocol is based is precisely **Bilinear Diffie-Hellman**: given $g, g^a, g^b, g^c$, computing $e(g,g)^{abc}$ is hard.


### IBE Scheme

Identity-based encryption (IBE) is a type of encryption that binds to the identity of the encryptor. Boneh and Franklin first proposed the construction of IBE cryptosystems using bilinear mappings in 2001. The characteristic of IBE is that public keys can be any string, such as an email address, phone number, etc., which eliminates the need for certificate management in traditional public key infrastructures (PKI). However, it also introduces a central trusted party known as the PKG, which is responsible for generating and distributing all keys.

{:.success}
**BF-IBE Encryption Algorithm**
Public parameters: Given a prime-order group $G$ of order $p$, there exists a bilinear mapping $e:G \times G \mapsto G_t$, let $g \in G$ be the generator, denote $\hat{g} = e(g,g) \in G_t$, and let the hash functions be $h_1 : \\{0,1\\}^{\star} \rightarrow G, h_2 : G_t \rightarrow \\{0,1\\}^{\star}$.

1. Initialization (Setup): PKG randomly selects $s \stackrel{R}{\leftarrow} \mathbb{Z}_p$, and generates PKG's public key as $g^s$.

2. Key Extraction: Alice and Bob can obtain their private keys from PKG:
   
   $$
   S_a = \textsf{MakeKey}(s, \textsf{'Alice'}) = h_1(\textsf{'Alice'})^s \\
   S_b = \textsf{MakeKey}(s, \textsf{'Bob'}) = h_1(\textsf{'Bob'})^s
   $$

   
3. Encryption: Alice sends an encrypted message $m$ to Bob, randomly selects $r \stackrel{R}{\leftarrow} \mathbb{Z}_p$, and then computes the ciphertext:
   
   $$
   \begin{aligned}
   \textsf{ Encrypt }\left(g, g^s, \textsf { 'Bob', } m\right) & =\left(g^r, m \oplus h_2\left(e\left(h_1(\textsf { 'Bob' }), g^s\right)^r\right)\right. \\
   & =\left( \underbrace{g^r}_{u}, \underbrace{ m \oplus h_2 (e(h_1(\textsf { 'Bob' }), g)^{r s}}_{v})\right)
   \end{aligned}
   $$4. Decryption: Given the encrypted message $(u, v)=\left(g^r, m \oplus h_2\left(e\left(h_1(\textsf{'Bob'}), g\right)^{r s}\right)\right.$, Bob's private key is $w= h_1(\textsf{'Bob'})^s$, the decryption algorithm is: $\textsf{Decrypt}(u, v, w)=v \oplus h_2(e(w, u)) $. The verification is as follows:

$$
\begin{aligned}
\textsf{Decrypt}(u, v, w)=v & \oplus h_2(e(w, u)) \\
= m &\oplus h_2\left(e\left(h_1(\textsf{'Bob'}), g\right)^{r s}\right) \\
& \oplus h_2\left(e\left(h_1(\textsf{'Bob'})^s, g^r\right)\right) \\
= m & \oplus h_2\left(e\left(h_1(\textsf{'Bob'}), g\right)^{r s}\right) \\
& \oplus h_2\left(e\left(h_1(\textsf{'Bob'}), g\right)^{r s}\right) \\
=m \\
\end{aligned}
$$

&nbsp;

The core principle of IBE is similar to Joux's tripartite DH protocol, where Bob's public key is $g^t = h_1(\textsf{'Bob'})$, with $t$ being an unknown number. Observing the entire encryption process, we find:

1. Alice's public key is $g^r$, and her private key is $r$.
2. The PKG's public key is $g^s$, and its private key is $s$.
3. Bob's public key is $g^t$, and his private key is $t$, but $t$ is unknown and computationally difficult. Thus, the PKG obfuscates its private key to issue Bob a private key $g^{ts} = h_1(\textsf{'Bob'})^s$.
4. The tripartite secret shared value: $e(h_1(\textsf{'Bob'}), g)^{r s} = e(g^t, g)^{rs} = \hat{g}^{rst}$, serves as the session key for simple XOR encryption with the original message.

Alice and Bob compute the secret shared value in exactly the same way as in Joux's tripartite DH protocol, but Bob is different; he does not have private key $t$, so he needs the PKG's help to compute $(g^t)^s = g^{st}$ for Bob through a previously authenticated secure channel. Normally, in the Joux protocol, Bob computes $e(g^r, g^s)^t$, whereas in BF-IBE, Bob computes $e(g^{st}, g^r) = \hat{g}^{rst}$.

{: .success}
**Remarks**: From the above analysis, it is not difficult to see that **BF-IBE**'s premise for a secure protocol is **Bilinear Diffie-Hellman**: Given $g, g^a, g^b, g^c$, computing $e(g,g)^{abc}$ is difficult.

## Historical Anecdotes

The first pairing in history associated with elliptic curves is the Weil pairing, named after the mathematician **André Weil**, who was imprisoned during World War II for refusing to serve in the French army, and it was in prison that he produced many significant mathematical results. In his autobiography, he wrote an interesting passage:

> I’m beginning to think that nothing is more conducive to the abstract sciences than prison... My mathematics work is proceeding beyond my wildest hopes, and I am even a bit worried - if it’s only in prison that I work so well, will I have to arrange to spend two or three months locked up every year?

**Weil believed that the best place for a mathematician to conduct research is in prison**, and he wished to spend a few months each year in prison to do mathematical research. Following this, Weil even considered whether he should suggest to the relevant authorities that each mathematician should spend some time in prison. Reality can be so surreal; you never know how "unconventional" a genius mathematician's ideas can be.

## References

Some references are as follows:

- [Intro to Bilinear Maps](https://people.csail.mit.edu/alinush/6.857-spring-2015/papers/bilinear-maps.pdf): This is the main reference for this article; the logical flow of the blog aligns with this slides.
- [Pairings or bilinear maps](https://alinush.github.io/2022/12/31/pairings-or-bilinear-maps.html): This blog covers the historical development of pairings and their application in constructing concise zero-knowledge proof protocols.
- [Pairings for beginners](https://static1.squarespace.com/static/5fdbb09f31d71c1227082339/t/5ff394720493bd28278889c6/1609798774687/PairingsForBeginners.pdf): This document introduces the mathematics behind pairings and details the technical aspects of elliptic curve pairings, which are not covered in the previous two documents and are relatively hardcore.