---
tags: ECC Projective-Plane Isomorphism
title: Elliptic Curves, Group Laws and Isomorphisms
published: true
---

{: .info}
**tl;dr:** Concepts of Weierstrass Curves, Projective Plane, Montgomery Curves and Twisted Edwards Curves. Brief notes and remarks of the [moon-math book](https://github.com/LeastAuthority/moonmath-manual).

<!--more-->

{: .success}
**Preface:** Lately, I've been diving into the [moon-math book](https://github.com/LeastAuthority/moonmath-manual). I found this book not just to be an excellent introduction to zero-knowledge proofs but also an excellent resource for beginners in elliptic curve cryptography, providing a high-level overview of many concepts without delving deeply into detailed proofs or mathematical intricacies. This article explains some basic concepts of elliptic curves. Although I have learned many ECC-related concepts in CTF contexts, a systematic study like this is highly beneficial for me, which is also the motivation behind this blog. This blog serves mostly as notes rather than a detailed specification and I strongly recommend reading the [moon-math book](https://github.com/LeastAuthority/moonmath-manual) for details, especially for those interested in ZKP and SNARK.


---

## Short Weierstrass Curves

Readers without a mathematical background should be most familiar with this form of elliptic curve, as it provides the simplest and most intuitive algebraic representation of elliptic curves.

### Definition

<section class="success" markdown="1">**Definition (_Short Weierstrass Curves_)**. Let $\mathbb{F}$ be a finite field of characteristic $q$ with $q>3$. The Short Weierstrass elliptic curve $E\_{a, b}(\mathbb{F})$ over $\mathbb{F}$ in its affine representation is the set of all pairs of field elements $(x, y) \in \mathbb{F} \times \mathbb{F}$ that satisfy the Short Weierstrass cubic equation $y^2=x^3+a \cdot x+b$, together with a distinguished symbol $\mathcal{O}$, called the point at infinity which is also the identity of the elliptic curve:

$$
\mathbf{E}_{a, b}(\mathbb{F})=\left\{(x, y) \in \mathbb{F} \times \mathbb{F} \mid y^2=x^3+a \cdot x+b\right\} \bigcup\{\mathcal{O}\}
$$

</section>  


<p class="error" markdown="1">**Non-singular**. Typically, we require $4 a^3+27 b^2 \ne 0$ (so-called non-singularity) **which loosely means that the curve has no cusps or self-intersections in the geometric sense,** if seen as an actual curve. Cusps and self-intersections would make the group law potentially ambiguous, i.e., the discrete logarithm over singular elliptic curve is trivial and extremely insecure for cryptography, referring to [this](https://github.com/jvdsn/crypto-attacks/blob/master/attacks/ecc/singular\_curve.py) and [this](https://ieeexplore.ieee.org/document/7426154/). Intuitively, we can think of the group law on a singular curve as degenerating into the addition group of the base finite field, **note that it is an addition group rather than a multiplication group.** The discrete logarithm of the addition group in the base finite field corresponds to the Euclidean division or inversion.
</p> 


**Isomorphic affine Short Weierstrass curves**:  Although we have not yet discussed the group law of the elliptic curve, we can classify elliptic curves to decide which pairs of parameters $(a, b)$ and $\left(a^{\prime}, b^{\prime}\right)$ instantiate equivalent curves in the sense that there is a 1:1 correspondence between the set of curve points. Let's see how isomorphic affine short Weierstrass curves can be derived from the underlying curve equations. We know that for isomorphic curves, their curve equation should be algebraically equivalent. For non-zero $c^6$ (we choose degree $6 = lcm(2,3)$ to avoid fractions in the exponents), we can rewrite a new equivalent curve equation as follows:

$$
c^6 y^2 = c^6(x^3 + a\cdot x + b) \\
\implies (c^3y)^2 = (c^2x)^3 + (a c^4) \cdot (c^2x) + c^6 b.
$$

Let $(a, b)$ and $\left(a^{\prime}, b^{\prime}\right)$ be two pairs of parameters. The isomorphism of $\mathbf{E}\_{a, b}(\mathbb{F})$ and $\mathbf{E}\_{a^{\prime}, b^{\prime}}(\mathbb{F})$  indicates the following relationship for some non-zero element $c$:  $a^{\prime}=a \cdot c^4$ and $b^{\prime}=b \cdot c^6$. The isomorphic map from points of $\mathbf{E}\_{a, b}(\mathbb{F})$ onto the curve points of $\mathbf{E}\_{a^{\prime}, b^{\prime}}(\mathbb{F})$ is given by:

$$
I: \mathbf{E}_{a, b}(\mathbb{F}) \rightarrow \mathbf{E}_{a^{\prime}, b^{\prime}}(\mathbb{F}):\left\{\begin{array} { l } 
{ ( x , y ) } \\
{ \mathcal { O } }
\end{array} \mapsto \left\{\begin{array}{l}
\left(c^2 \cdot x, c^3 \cdot y\right) \\
\mathcal{O}
\end{array}\right.\right.
$$

This map is a $1: 1$ correspondence, and its inverse map is given by mapping the point at infinity onto the point at infinity, and mapping each curve point $(x, y)$ onto the curve point $\left(c^{-2} x, c^{-4} y\right)$.


<section class="info" markdown="1">
**J-invariant**: As we can see, if $a^{\prime}=a \cdot c^4$ and $b^{\prime}=b \cdot c^6$ hold, it is equivalent to:

$$
(\frac{a^\prime}{a})^3 = (\frac{b^\prime}{b})^2
$$

Let's define $j := \frac{a^3}{b^2}$. If such an invariant is the same for two different curves, they are isomorphic affine short Weierstrass curves. The standard $j$-invariant indicating the equivalence/isomorphism of curve $ \mathbf{E}\_{a, b}(\mathbb{F})$ is:

$$
j(\mathbf{E}) = 1728 \frac{4a^3}{4a^3 + 27b^2}.
$$

It's easy to see that $j(\mathbf{E})$ is determined by the value of $\frac{a^3}{b^2}$ if the edge conditions $a,b=0$ and $4a^3 + 27b^3 = 0$ are not considered. That's why the $j$-invariant can be used to classify elliptic curves.
</section>  


### Group Laws

Group laws of elliptic curve are all based on so-called chord-and-tangent rule. It's important to view elliptic curves in finite fields as curve (though they are just scattered points graphically) and the addition law involves finding the third intersection point of the line passing through two given points on the curve. Consider the line $\ell$ which intersects the curve in $P$ and $Q$ (if $Q=P$, we count it twice). If $\ell$ intersects the elliptic curve at a third point $R$, define the sum of $P$ and $Q$ as the reflection of $R^\prime$ at the x-axis: $R = P + Q$. If the line $\ell$ does not intersect the curve at a third point, define the sum to be the point at infinity $\mathcal{O}$. If the two points are the same, we define $\ell$ as the tangent line.

These definitions are quite meaningful geometrically. To ensure the definitions are well-defined, we must also address an algebraic property: ensuring that any line intersects the elliptic curve at no more than three points. Otherwise, the addition law would become ambiguous. Actually, every line implies a linear relationship of $x, y$. To find the intersecting points, we only need to solve a univariate polynomial of degree at most 3 after applying the linear reduction. By the fundamental theorem of finite fields, there are at most $3$ roots for degree-3 univariate polynomial. This shows that our group laws are well-defined.

<section class="success" markdown="1">
**Chord-and-Tangent Group Laws**:

- (**Identity Law**) For point at infinity, $P + \mathcal{O} = P$.

- (**Inverse Law**) Let $P = (x, y)$ and $Q=(x, -y)$. Define $P + Q = \mathcal{O}$ since in this case there are only two intersecting points.

- (**Tangent Law**) Let $P = (x, y)$ with $y \ne 0$, compute the slope of tangent line 
  
  $$
  s = \frac{3x^2 + a}{2y}
  $$

  Let $2P = P + P = (x^\prime, y^\prime)$ given by:

  $$
  \begin{cases}
  x^\prime = s^2 - 2x\\
  y^\prime = s(x - x^\prime) - y
  \end{cases}
  $$

- (**Chord Law**) Let $P = (x\_1, x\_2), Q = (x\_1, x\_2)$ with $x\_1 \ne x\_2$, compute the slope of chord line:
  
  $$
  s = \frac{y_2 - y_1}{x_2 - x_1}
  $$

  Let $R = P + Q = (x\_3, y\_3)$ given by:
  
  $$
  \begin{cases}
  x_3 = s^2 - x_1 - x_2\\
  y_3 = s(x_1 - x_3) - y_1
  \end{cases}
  $$

</section>  

Alright, all group laws are understandable except that the identity element $\mathcal{O}$. Why do we need to define a point at infinity which does not satisfy the curve equation? Why is a point at infinity the identity element? These questions can be well explained in the following elliptic curve definitions in projective planes.



## Projective Weierstrass Curves

Projective space provides a better definition of elliptic curves and offers more efficient group operation formulas. The group law discussed in the previous section involves computing the multiplicative inverse, whereas the formulas in projective space only involve finite field multiplication and addition, significantly improving efficiency. Most cryptographic libraries implement projective elliptic curves, as SageMath does.

### Projective Plane

A widely known axiom is that two lines either intersect or are parallel. This axiom holds on the ordinary Euclidean plane but does not hold in the projective plane. A projective plane can be thought of as an ordinary plane, but equipped with an additional “point at infinity” such that two different lines always intersect in a single point, i.e., parallel lines intersect “at infinity”. 

<section class="success" markdown="1">
**Definition (_Projective Plane_).** Let $\mathbb{F}$ be a field and $\mathbb{F}^3 := \mathbb{F}\times \mathbb{F} \times \mathbb{F}$. For any point $x = (X, Y, Z)$, there is exactly one line $L\_x$ in $\mathbb{F}^3$ that intersects both $(0,0,0)$ and $x$. All points on the line $L\_x$ are equivalent in the projective plane. A element (point) in the projective plane over $\mathbb{F}$ can then be defined as such a line if we exclude the intersection of that line with $(0,0,0)$. This leads to the following definition of a point in projective geometry:

$$
[X: Y: Z]:=\left\{(k \cdot X, k \cdot Y, k \cdot Z) \mid k \in \mathbb{F}^*\right\}
$$

Then the projective plane of that field is then defined as the set of all points excluding the point $[0: 0: 0]$ :

$$
\mathbb{F} \mathbb{P}^2:=\left\{[X: Y: Z] \mid(X, Y, Z) \in \mathbb{F}^3 \text { with }(X, Y, Z) \neq(0,0,0)\right\}
$$

</section>  

The equivalent element in projective plane can be normalized in a unified representation. Typically, we normalize the third dimension into 1 (if $Z$ is not zero) and thus the elements of projective plane can be classified as follows:

- **Affine Points**: $[X:Y:1]$.
- **Points at Infinity**: $[X:Y:0]$.
- **Line at Infinity**: $[1:0:0]$.

We give a brief analysis of the number of elements in projective plane $\mathbb{F} \mathbb{P}^2$. Let $q$ be the order $\mathbb{F}$. Since we have $q^{3} - 1$ points in total and each element of  $\mathbb{F} \mathbb{P}^2$ contains $q - 1$ points. Thus, the number of projective points is given by:

$$
\frac{q^{3} - 1} {q - 1} = q^{2} + q + 1.
$$


### Projective Weierstrass Curves

We can extend the affine Weierstrass curve $\mathbf{E}\_{a, b}(\mathbb{F})$ into the projective space $\mathbb{F} \mathbb{P}^2$ by homogenizing the curve equation. To make a polynomial homogeneous, we usually introduce a new variable $z$:

$$
\textsf{HOM}: f(x,y) \mapsto f(\frac{x}{z}, \frac{y}{z}) \cdot z^{\deg f}.
$$

After homogenizing the Weierstrass curve equation, we obtain the projective Weierstrass curve:

$$
\mathbf{E}_{a, b}(\mathbb{FP^2}) = \{ [X:Y:Z] \in \mathbb{FP^2} | Y^2 Z = X^3 + aXZ^2 + b Z^3\}
$$

The projective Weierstrass curve contains points which are not in the original Weierstrass curve: $[X:Y:0]$ and this is exactly the point at infinity. Note that for $Z =0$, we have $X =0$ from the projective curve equation. After normalization, the point at infinity is unique: $[0:1:0]$ and one can often see this point in SageMath by calling `E.zero()`. For other points, we can normalize $Z$ into 1 and the first two coordinates of $[X:Y:1]$ are the original point of the affine Weierstrass curve $\mathbf{E}\_{a, b}(\mathbb{F})$.

<section class="warning" markdown="1">
The group isomorphism of projective and affine Weierstrass curves are given by:

$$
I: \mathbf{E}(\mathbb{F}) \rightarrow \mathbf{E}\left(\mathbb{F P}^2\right): 
\begin{cases}
(x, y) & \mapsto[x: y: 1] \\
\mathcal{O} & \mapsto[0: 1: 0]
\end{cases} \\
I^{-1}: \mathbf{E} \left(\mathbb{F P}^2\right) \rightarrow \mathbf{E} (\mathbb{F}):[X: Y: Z] \mapsto \begin{cases}\left(\frac{X}{Z}, \frac{Y}{Z}\right) & \text { if } Z \neq 0 \\ \mathcal{O} & \text { if } Z=0\end{cases}
$$

</section>  

Now we turn to the key advantage of projective coordinates. The following text is taken from moon-math book:

> One of the key features of projective coordinates is that, in projective space, it is guaranteed that any chord will always intersect the curve in three points, and any tangent will intersect it in two points. So, the geometric picture simplifies, as we don’t need to consider external symbols and associated cases. The price to pay for this mathematical simplification is that projective coordinates might be less intuitive for beginners.

The group laws in the affine Weierstrass curve $\mathbf{E}\_{a, b}(\mathbb{F})$ require computing multiplicative inversion of finite field in each addition. However, in projective Weierstrass curve, there are only multiplication and addition arithmetic. Only when we need to normalize the $Z$-coordinate, we have to compute one multiplicative inversion. In detail,  the inverse element of $[X:Y:Z]$ is given by $[X:-Y:Z]$ and the full addition law (a similar chord-and-tangent rule) is given by the following algorithm.

<details class="info">
<summary><b>projective_law.py</b></summary>
<section markdown="1">

``` python
def add_points(P, Q, a, b, p):
    """
    Adds two points P and Q on the elliptic curve ZY^2 = X^3 + aZ^2X + bZ^3 over finite field F_p.
    P = (X1, Y1, Z1) and Q = (X2, Y2, Z2) are given in projective coordinates.

    :param P: Tuple (X1, Y1, Z1) representing point P in projective coordinates.
    :param Q: Tuple (X2, Y2, Z2) representing point Q in projective coordinates.
    :param a: Coefficient 'a' in the elliptic curve equation.
    :param b: Coefficient 'b' in the elliptic curve equation.
    :param p: The prime modulus for finite field F_p.
    :return: The sum of points P and Q in projective coordinates (X3, Y3, Z3).
    """
    X1, Y1, Z1 = P
    X2, Y2, Z2 = Q
    Z = (0, 1, 0)
    # Case 0: If infinity exists.
    if P == Z:
        return Q
    elif Q == Z:
        return P
    U1 = (Y2 * Z1) % p
    U2 = (Y1 * Z2) % p
    V1 = (X2 * Z1) % p
    V2 = (X1 * Z2) % p
    if V1 == V2:
        # Case 1: If P == -P (point inverse)
        if U1 != U2 or Y1 == 0:
            return (0, 1, 0)
        # Case 2: If P == Q (point doubling)
        else:
            W = (a * Z1**2 + 3 * X1**2) % p
            S = (Y1 * Z1) % p
            B = (X1 * Y1 * S) % p
            H = (W**2 - 8 * B) % p
            X3 = 2 * H * S
            Y3 = W * (4 * B - H) - 8 * Y1**2 * S**2
            Z3 = 8 * S**3
            return (X3 % p, Y3 % p, Z3 % p)
     else:
        # Case 2: If P == Q (point addition)
        U = (U1 - U2) % p
        V = (V1 - V2) % p
        W = (Z1 * Z2) % p
        A = (U**2 * W - V**3 - 2 * V**2 * V2) % p
        X3 = V * A
        Y3 = U * (V**2 * V2 - A) - V**3 * U2
        Z3 = V**3 * W
        return (X3 % p, Y3 % p, Z3 % p)
```

</section>  
</details>

## ZK-Friendly Elliptic Curves

In this section, we focus on a subset of elliptic curves on which faster algorithms for the group law or the scalar multiplication exist. The so-called Montgomery curves allow for constant time algorithms for (specializations of) the elliptic curve scalar multiplication. The twisted Edwards curves are isomorphic to Montgomery curves which are especially ZK-friendly since the group laws have no branching. 

### Montgomery Curve

<section class="success" markdown="1">
**Definition (_Montgomery Curve_).** A Montgomery elliptic curve $\mathbf{M}(\mathbb{F})$ over $\mathbb{F}$ in its affine representation is the set of all pairs of field elements $(x, y) \in \mathbb{F} \times \mathbb{F}$ that satisfy the Montgomery cubic equation $B \cdot y^2=x^3+A \cdot x^2+x$, together with a distinguished symbol $\mathcal{O}$, called the point at infinity.

$$
\mathbf{M}_{A, B}(\mathbb{F})=\left\{(x, y) \in \mathbb{F} \times \mathbb{F} \mid B \cdot y^2=x^3+A \cdot x^2+x\right\} \bigcup\{\mathcal{O}\}
$$

</section>  

The Montgomery curves can always be isomorphic to Weierstrass curves. However, a Weierstrass curve can be isomorphic to a Montgomery curve if and only if the following conditions hold:
- Order of the Weierstrass curve is divisible by 4: $\mid \mathbf{E}(\mathbb{F}) \mid = 4k$.
- The polynomial $f(z) = z^3 + az + b \in \mathbb{F}[z]$ has at least one root $z\_0 \in \mathbb{F}$.
- The value $3z\_0^2 + a$ is a quadratic residue. Let $s:= (\sqrt{3z\_0^2 + a})^ {-1}$.

Using above remarks, we have the following isomorphisms:

<section class="warning" markdown="1">
**Mappings between Montgomery curve and Weierstrass curve.**

- Isomorphism from Montgomery curve to Weierstrass curve：
  
  $$
  \begin{aligned}
  \textsf{I}:\mathbf{M}_{A, B}(\mathbb{F}) & \mapsto \mathbf{E}_{a, b}(\mathbb{F}): 
  \begin{cases}
  a = \frac{3- A^2}{3B^2} \\
  b = \frac{2A^3 - 9 A}{27 B^3} 
  \end{cases}
  \\
  (x, y) & \mapsto (\frac{3x + A}{3B}, \frac{y}{B})
  \end{aligned}
  $$

- Isomorphism from Weierstrass curve to Montgomery curve：
  
  $$
  \begin{aligned}
  \textsf{I}^{-1}: \mathbf{E}_{a, b}(\mathbb{F})  & \mapsto \mathbf{M}_{A, B}(\mathbb{F}) : 
  \begin{cases}
  A = 3 z_0 s\\
  B = s
  \end{cases}
  \\
  (x, y) & \mapsto \left(s \left(x - z_0\right), sy\right)
  \end{aligned}
  $$

</section>  

&nbsp;

<section class="info" markdown="1">
**Montgomery Group Law**

- (**Tangent Law**) Let $P = (x, y) \in \mathbf{M}\_{A, B}(\mathbb{F})$ with $y \ne 0$, compute the slope of tangent line 

  $$
  s = \frac{3x^2 + 2Ax + 1}{2By}
  $$

  Let $2P = P + P = (x^\prime, y^\prime)$ given by:
  
  $$
  \begin{cases}
  x^\prime = s^2 B - 2x - A\\
  y^\prime = s(x - x^\prime) - y
  \end{cases}
  $$

- (**Chord Law**) Let $P = (x\_1, x\_2), Q = (x\_1, x\_2)$ with $x\_1 \ne x\_2$, compute the slope of chord line:
  
  $$
  s = \frac{y_2 - y_1}{x_2 - x_1}
  $$
  
  Let $R = P + Q = (x_3, y_3)$ given by:
  
  $$
  \begin{cases}
  x_3 = s^2B - x_1 - x_2 - A\\
  y_3 = s(x_1 - x_3) - y_1
  \end{cases}
  $$

</section>  


### Twisted Edwards Curves

> Paper: [Twisted Edwards Curves](https://eprint.iacr.org/2008/013.pdf).

<section class="success" markdown="1">
**Definition (_Twisted Edwards Curves_).** A twisted Edwards curve $\mathbf{T}(\mathbb{F})$ over $\mathbb{F}$ in its affine representation is the set of all pairs of field elements $(x, y) \in \mathbb{F} \times \mathbb{F}$ that satisfy the twisted Edwards equation $a x^2 + y^2 = 1 + dx^2 y^2$ for non-zero and distinctive $a, d \in \mathbb{F}^*$.

$$
\mathbf{T}_{a,d}(\mathbb{F})=\left\{(x, y) \in \mathbb{F} \times \mathbb{F} \mid a x^2 + y^2 = 1 + dx^2 y^2\right\}
$$

**Note**: A Twisted Edwards curve is called a ZK-friendly Twisted Edwards curve if the parameter $a$ is a quadratic residue and the parameter $d$ is a quadratic non-residue. **We does not need a special symbol to represent the point at infinity.**
</section>  

&nbsp;

<section class="warning" markdown="1">
**Mappings between Montgomery curve and twisted Edwards curve.**

- Isomorphism from twisted Edwards curve to Montgomery curve (birationally equivalent)：
  
  $$
  \begin{aligned}
  \textsf{I}:\mathbf{T}_{a, d}(\mathbb{F}) & \mapsto \mathbf{M}_{A, B}(\mathbb{F}): 
  \begin{cases}
  A = \frac{a + d}{a - d} \\
  B = \frac{4}{a - d} 
  \end{cases} \text{ where } a \ne d, a,d \ne 0
  \\
  (x, y) & \mapsto (\frac{1 + y}{1-y}, \frac{1 + y}{1-y}x)
  \end{aligned}
  $$

- Isomorphism from Montgomery curve to twisted Edwards curve (birationally equivalent)：
  
  $$
  \begin{aligned}
  \textsf{I}^{-1}:\mathbf{M}_{A, B}(\mathbb{F}) & \mapsto \mathbf{T}_{a, d}(\mathbb{F}) : 
  \begin{cases}
  a = \frac{A + 2}{B} \\
  b = \frac{A - 2}{B} 
  \end{cases}
  \text{ where } A \ne \pm2, B \ne 0
  \\
  (x, y) & \mapsto (\frac{x}{y}, \frac{x - 1}{x + 1})
  \end{aligned}
  $$

</section>  


Notes:

- Detailed proof can be found in Theorem 3.2 in [Twisted Edwards Curves](https://eprint.iacr.org/2008/013.pdf).
- Before or after the isomorphism, we can rescale some parameter, e.g., [Birational Equivalence of Twisted Edwards and Montgomery curves](https://math.stackexchange.com/questions/1391732/birational-equvalence-of-twisted-edwards-and-montgomery-curves). Consider mapping $\textsf{I}$, we can rescale $Y := sy$ with $s \ne 0$ of $B \cdot y^2=x^3+A \cdot x^2+x$ and the new mapping becomes:
  
  $$
  \begin{aligned}
  \textsf{I}:\mathbf{T}_{a, d}(\mathbb{F}) & \mapsto \mathbf{M}_{A, B}(\mathbb{F}): 
  \begin{cases}
  A = \frac{a + d}{a - d} \\
  B = \frac{4}{a - d} s^2
  \end{cases} \text{ where } a \ne d, a,d \ne 0
  \\
  (x, y) & \mapsto (\frac{1 + y}{1-y}, \frac{1 + y}{1-y}x s)
  \end{aligned}
  $$

  If $\frac{4}{a-d}$ is quadratic residue, we can always rescale $B = 1$ by letting $s = (\sqrt{\frac{4}{a-d}})^{-1}$.

<section class="info" markdown="1">
**Twisted Edwards Group Law.** In a twisted Edwards curve, we have the simplest group law without extra definition of identity or annoying branching. Given two points $(x\_1, y\_1)$ and $(x\_2, y\_2)$, the sum of them is given by:

$$
(x_1, y_1) + (x_2, y_2) = (\frac{x_1y_2 + y_1x_2}{1 + dx_1x_2y_1y_2}, \frac{y_1y_2 - ax_1x_2}{1-dx_1x_2y_1y_2}).
$$

</section>  

We can see that the point $(0,1)$ lies on $\mathbf{T}\_{a, d}(\mathbb{F})$ and serves as the identity element.

$$
(x_1, y_1) + (0, 1) = (\frac{x_1 \cdot 1 + 0}{1 + 0}, \frac{y_1 \cdot 1 - 0}{1 - 0}) = (x_1, y_1).
$$

Proving computation with branching is expensive in state-of-the-art zero-knowledge proofs. Therefore, such group laws without condition branching is ZK-friendly. Refer to [Twisted Edwards Elliptic Curves for Zero-Knowledge Circuits](https://www.mdpi.com/2227-7390/9/23/3022) to see how to use twisted Edwards curve in ZK.

## End

- There are actually many other forms of elliptic curves which are not covered in this blog, such as Hessian curves, Jacobi quartic curves, etc. One can refer to [Explicit-Formulas Database](https://www.hyperelliptic.org/EFD/) for more details. There are even techniques to implement the addition law of elliptic curves based on single coordinate, such as the constant-time x-coordinate ladder: [The Brier–Joye ladder](https://link.springer.com/chapter/10.1007/3-540-45664-3_24).
- We do not discuss the security of elliptic curves in this blog. I find this site: [safecurves](https://safecurves.cr.yp.to/) and this repository [Known Attacks On Elliptic Curve Cryptography](https://github.com/elikaski/ECC_Attacks) to be a good resource for learning the security of elliptic curves.

---
