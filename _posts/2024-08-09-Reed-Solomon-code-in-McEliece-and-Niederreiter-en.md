---
tags: Code-Based-Cryptography Reed-Solomon-Code Sidelnikov-Shestakov-Attack
title: Reed-Solomon code in McEliece and Niederreiter
hidden: true
key: rs-mceliece-niederreiter
lang: en
---



{: .info}
**Abstract:** This article introduces the Generalized Reed-Solomon Code (GRS) along with the McEliece and Niederreiter encryption algorithms. Although GRS is a very efficient linear code, the standard McEliece implementation uses Goppa Code instead of the simpler and more efficient GRS code due to security issues with GRS encoding in the aforementioned two cryptosystems, namely the Sidelnikov-Shestakov attack. This blog provides a brief introduction to GRS linear coding and its associated attacks.

<!--more-->

{: .error}
**Disclaimer:** This article is automatically translated from Chinese based on the open source tool [GPT-Academic](https://github.com/binary-husky/gpt_academic), using the [OpenAI-GPT-4o-mini](https://platform.openai.com/docs/models/gpt-4o-mini) model. If there are any ambiguities or mistakes, please switch to the original Chinese blog.

Main references:

1. [Brief of Sidelnikov Shestakov Attack for GRS Codes-based Cryptosystems](https://www.researchgate.net/publication/369325541_Brief_of_Sidelnikov_Shestakov_Attack_for_Generalized_Reed-Solomon_Codes-based_Cryptosystems)
2. [Sidelnikov-Shestakov attack on Reed-Solomon code in McEliece](https://crypto-kantiana.com/elena.kirshanova/talks/Sidelnikov_Shestakov.pdf)

## Generalized Reed-Solomon Code

{: .error}
**Definition**: Generalized Reed-Solomon Code

Let $k$ be a positive integer such that $k \le n \le q$. Let $\alpha \in \mathbb{F}_q^n$ be a tuple of distinct elements, i.e. $\alpha = (\alpha_1, \cdots, \alpha_n)$ where $\alpha_i \neq \alpha_j, \forall i \neq j \in [1, \cdots, n]$ . Let $\beta \in \mathbb{F}_q^n$ be a non-zero tuple, i.e. $\beta = (\beta_1, \cdots, \beta_n)$ , where $\beta_i \neq 0 , i \in [1, \cdots, n]$ . 

The generalized Reed-Solomon code denoted as $\operatorname{GRS}_{n, k}(\alpha, \beta)$ with code length $n$ and dimension $k$ is defined as follows:

$$
\operatorname{GRS}_{n, k}(\alpha, \beta)=\left\{\left(\beta_1 f\left(\alpha_1\right), \ldots, \beta_n f\left(\alpha_n\right)\right) \mid f \in \mathbb{F}_q[x], \operatorname{deg}(f)<k\right\} .
$$

When $\beta=(1, \ldots, 1)$ , it is referred to as Reed-Solomon (RS) coding, denoted as $\operatorname{RS}_{n, k}(\alpha)$ .

&nbsp;

### Generator Matrix

The generator matrix of GRS coding can be interpreted as a Vandermonde-like matrix multiplied by a diagonal matrix, where each row corresponds to terms of different degrees of the polynomial (from 0 to $k-1$ ) and each column corresponds to different evaluation points $a_i$ , multiplied by the respective $\beta_i$ in the weight vector.

For example, when $\beta_i = 1$ , the Vandermonde matrix becomes the most common RS coding, and the generator matrix is:

$$
G_{RS} = \left(\begin{array}{ccc}
1 & \cdots & 1 \\
\alpha_1 & \cdots & \alpha_n \\
\vdots & & \vdots \\
\alpha_1^{k-1} & \cdots & \alpha_n^{k-1}
\end{array}\right)
$$

The generator matrix for the generalized $\operatorname{GRS}_{n, k}(\alpha, \beta)$ is:

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

**Polynomial Expression**: According to the definition, the message in GRS coding is actually the evaluation values of a $(k-1)$ -degree polynomial at $n$ points, denoted as $m = (f_0, f_1, \cdots , f_{k-1})$ , which corresponds to some polynomial $f(x) = \sum_{i=0}^{k-1} f_i x^i$ with $k$ coefficients. The encoded message is then:

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
**Remarks**: GRS codes are MDS codes, meaning that the minimum Hamming distance of GRS reaches the maximum upper bound known as the Singleton Bound, thus achieving optimum error correction capability. The fast unique decoding algorithm for GRS can correct up to $t = \lfloor \frac{n-k}{2} \rfloor$ errors in polynomial time.

### Parity-check Matrix

The parity-check matrix $H$ satisfies

$$
\forall c \in \mathcal{C}(G), \quad cH = 0 \\
\iff  GH = 0 \\
\implies H = \mathcal{KER}_{R}(G)
$$

Thus, $H$ is the right kernel space of the generator matrix $G_{GRS}$ .

In particular, the dual coding of GRS encoding is also GRS coding, and the generator matrix for the dual code is just the aforementioned $H$ .

&nbsp;

**Theorem**: The dual code of $\operatorname{GRS}_{n, k}(\alpha, \beta)$ (with the dual generator matrix being the parity-check matrix) satisfies:

$$
\boldsymbol{G R S}_{n,k}(\boldsymbol{\alpha}, \boldsymbol{\beta})^{\perp}=\boldsymbol{G R S}_{n,n-k}\left(\boldsymbol{\alpha}, \boldsymbol{\gamma}\right),
$$

The vector $\gamma$ satisfies

$$
\gamma_i=\beta_i^{-1} \prod_{\substack{j=1 \\ j \neq i}}^n\left(\alpha_i-\alpha_j\right)^{-1} .
$$

Related proofs can be found in [Introduction to Coding Theory. Section 6.2](https://wwwlix.polytechnique.fr/~alain.couvreur/doc_ens/lecture_notes.pdf).

## Niederreiter & McEliece

Niederreiter is one of the earliest post-quantum cryptosystems based on linear coding, while McEliece is the most famous and promising post-quantum cryptosystem in the NIST standard. However, using GRS coding in both of these cryptosystems is not secure.

The principles of coding-based cryptographic systems are fundamentally similar, mainly utilizing hidden coding structures as trapdoors, namely:

- Public keys conceal structure through matrix masking, appearing similar to random coding, with generally average error-correcting decoding efficiency.
- The private key holder possesses trapdoor information and can transform the ciphertext into specially encoded codewords, allowing for efficient decoding to obtain the message.

&nbsp;

The core differences between Niederreiter and McEliece are:

- Niederreiter encodes plaintext as an error vector, resulting in a syndrome after encryption (based on the **Syndrome Decoding Problem**).
- McEliece encodes plaintext as a vector in plaintext space, resulting in a codeword with errors after encryption (based on the error-correcting decoding problem).

The error-correcting decoding problem and the SDP problem are essentially the same.

### Niederreiter Cryptosystem

{: .success}
**Step 1. Key Generation**

- Generate a random permutation matrix $P_{n \times n}$ 
- Generate a random invertible matrix $S_{(n-k) \times (n-k)}$ 
- Coding parameters are the GRS check matrix $(n, k)$ : $H_{(n-k) \times n}$ , with maximum error-correcting capacity $t$ .
- **Public Key**: ${\hat H} = (SHP)_{(n-k) \times n}$ 
- **Private Key**: matrices $S, H, P$ 

{: .success}
**Step 2. Encryption**

- Plaintext Encoding: Encode the message as an $n$ -dimensional error vector, where the Hamming weight of $m$ is less than $t$ .
  
- Encryption: The ciphertext is the syndrome of the corresponding error vector, i.e.,

$$
  c = {\hat H} \cdot m^T
$$

{: .success}
**Step 3. Decryption**

- Calculate $\bar c = S^{-1}c = H(mP^T)^T$ 
- Using the GRS decoding algorithm, decode to obtain $y$ such that $Hy^T = \bar c$ 
- According to coding theory, the above decoding value is unique, i.e., $y = mP^T$ 
- Recover plaintext: $m = yP$ (the permutation matrix satisfies $PP^T = I$ )

### McEliece Cryptosystem

{: .success}
**Step 1. Key Generation**

- Generate a random permutation matrix $P_{n \times n}$ 
- Generate a random invertible matrix $S_{k \times k}$ 
- Select an efficient $(n,k)$ -linear code, such as Goppa codes, resulting in a generator matrix $G_{k \times n}$ , with maximum error-correcting capacity $t$ .
- **Public Key**: $(\hat G = (SGP)_{k \times n}, t)$ 
- **Private Key**: matrices $S, G, P$ 

{: .success}
**Step 2. Encryption**

- Plaintext Encoding: Encode the message as a $k$ -dimensional plaintext vector $m$ .

- Encryption: Generate a random error vector $z \in \mathbb{F}_{q}^{n}$ with Hamming weight $t$ , resulting in a ciphertext that is a codeword with errors:
  

$$
  c = m \hat G + z
$$

{: .success}
**Step 3. Decryption**

- Calculate $\bar c = c P^{-1} = (mS)G + zP^{-1}$ 
- Because $P^{-1} = P^T$ is also a permutation matrix, $zP^{-1}$ has a Hamming weight less than $t$ .
- Use the corresponding coding to efficiently decode $\bar c$ , obtaining $y = mS$ 
- Recover plaintext: $m = y S^{-1}$ 

## Sidelnikov-Shestakov attack

If GRS coding is used, the generator matrix and check matrix are essentially the same; from the analysis perspective, they are the same in both Niederreiter and McEliece. Taking Niederreiter as an example, we introduce the Sidelnikov-Shestakov attack on GRS coding, also known as the Russian Attack.

The idea behind the Sidelnikov-Shestakov attack is to recover the structure of the GRS coding through the public key $\hat{H}$ . Note that any GRS check matrix multiplied on the left by a permutation matrix (column permutation) is still a GRS code, so our goal is to recover an equivalent check matrix $\bar{H} = HP$ of the ${GRS}_{n, k}(\alpha, \beta)$ code. That is, recover the equivalent vectors:

$$
\alpha = (\alpha_1, \cdots, \alpha_{n}), \beta = (\beta_1, \cdots, \beta_{n})
$$

### Algebraic Expression

The above problem can be completely modeled into the following scenario, where the private key is $H_{(n-k) \times n}$ as a check matrix of a $GRS_{n, k}(\alpha, \beta)$ code, given a Niederreiter public key $\hat H = S H$ , recover an equivalent check matrix of the $GRS_{n, k}(\bar \alpha, \bar \beta)$ code. That is to solve for a set of $S, H$ or $\alpha, \beta$ vectors.

For ease of expression, we directly consider the complete expression of the check matrix of size $k \times n$ :

$$
\begin{aligned}
\hat H &= S \cdot H \\
&= 
\left(\begin{array}{ccc}
s_{1,1} & s_{1,2} & \cdots & s_{1, k} \\
s_{2,1} & s_{2,2} & \cdots & s_{2, k} \\
 \vdots & \vdots & \cdots & \vdots \\
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

where the polynomial $f_i(x) = \sum_{j} s_{i, j} x^j$ is a polynomial of degree $k-1$ . Since $S$ is an invertible matrix, $f_i(x)$ are linearly independent polynomials.

&nbsp;

**Key Points**

Apply linear (rational) transformations to GRS coding, considering the transformation:

$$
(ax + b)^i = \sum_{j=0}^{k - 1} m_{i,j} x^j \\
\implies M = (m_{i,j}) , \quad \text{lower-triangular}
$$

Thus the matrix $M$ left-multiplied by the parity-check matrix of the $GRS_{n, k}(\alpha, \beta)$ code yields a new parity-check matrix for the $GRS_{n, k}(\bar \alpha, \bar  \beta)$ code, where

$$
\bar \alpha = (a \alpha_1 + b, \cdots, a \alpha_{n} + b), \bar \beta = (\beta_1, \cdots, \beta_{n})
$$

Therefore:

$$
\hat H = \underbrace{SM^{-1}}_{S^\prime} \underbrace{MH}_{H^\prime}
$$

Then $S^\prime, H^\prime$ is also a feasible solution, denoting this solution as $S^\prime, \bar \alpha, \bar \beta$ .

For convenience, consider incorporating $\infty$ into $\mathbb{F}_q$ , denoting it as $\mathbb{F}_q^{\infty}$ , satisfying:

$$
\left\{\begin{array}{lr}
\frac{1}{\infty} = 0 \\
\frac{1}{0} = \infty \\
f(\infty) = f_{degf}
\end{array}
\right.
$$

In fact, consider any bilinear transformation

$$
\phi(x) = \frac{ax+ b}{cx + d}, \quad ab -cd \ne 0
$$

to generate a new solution $SM_{\phi}^{-1}, \phi(\alpha), \tau(\beta)$ . Where

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

Therefore, for any $\alpha_1, \alpha_2, \alpha_3 \in \mathbb{F}_q^{\infty}$ , we can find a suitable bilinear transformation such that,

$$
\begin{aligned}
\phi(\alpha_1) &= 1 \\
\phi(\alpha_2) &= 0 \\
\phi(\alpha_3) &= \infty 
\end{aligned}
$$

We want to search for solutions in the following special form:

$$
\bar S, \bar \alpha = (1, 0, \infty, a_4, \cdots , \alpha_{n}), \bar \beta = (\beta_1, \cdots, \beta_{n}), \alpha_i \notin \{0,1, \infty\} \quad i \ge 4 \tag{a}
$$

### Special Solution for RS

Substituting the solution in the form of $(a)$ into the public key:

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

First, we consider the simple case where $\beta_1 = \beta_2 =\cdots = \beta_{n}  = 1$ .

{: .success}
**Step 1. Solve the kernel space $\\{1, k + 1, k+2, \cdots, 2k - 2\\}$**

Select $k-1$ column vectors $\\{1, k + 1, k+2, \cdots, 2k - 2\\}$ , let $c_1 \in \mathbb{F}_q^{k}$ , and find their left kernel space:

$$
\begin{aligned}
\left\langle\mathbf{c}_1, f^{(i)}\left(\alpha_1\right)\right\rangle & =0, \\
& \vdots \\
\left\langle\mathbf{c}_1, f^{(i)}\left(\alpha_{2(k-1)}\right)\right\rangle & =0 .
\end{aligned}
$$

Let:

$$
F_1(x) := \sum_{i=1}^{n-k} c_{1, i} f^{(i)}(x)
$$

Then $F_1(x)$ takes the value 0 at $\alpha_1, \alpha_{k + 1},  \alpha_{k + 2}, \cdots,  \alpha_{2(k - 1)}$ and the degree of $F_1(x)$ does not exceed $k-1$ , thus, it must be a polynomial of the following form:

$$
F_1(x)=a_1\left(x-\alpha_1\right)\left(x-\alpha_{k+1}\right) \cdots\left(x-\alpha_{2(k-1)}\right) \tag{F1}
$$

where

$$
a_1 = F_1(\infty) = F_1(\alpha_3) = \sum_{i=1}^{k} c_{1,i} f^{(i)}(\alpha_3) = \sum_{i=1}^{k} c_{1,i} \hat H_{i, 3}
$$

In addition, the point values of any zero points outside $\alpha_j$ at $F_1(x)$ can be computed using the matrix $\hat H$ :

$$
F_1\left(\alpha_j\right)=\sum_{i=1}^{k} c_{1, i} f^{(i)}\left(\alpha_j\right)=\sum_{i=1}^{k} c_{1, i} \hat H_{i, j} \tag{E1}
$$

{: .success}
**Step 2. Solve the kernel space $\\{2, k + 1, k+2, \cdots, 2k - 2\\}$**

Similarly, solve the left kernel space to obtain the vector $c_2 \in \mathbb{F}_q^{k}$ , thus obtaining

$$
F_2(x)=a_2\left(x-\alpha_2\right)\left(x-\alpha_{k+1}\right) \cdots\left(x-\alpha_{2(k-1)}\right) \tag{F2}
$$

where

$$
a_2 = F_2(\infty) = F_2(\alpha_3) = \sum_{i=1}^{k} c_{2,i} f^{(i)}(\alpha_3) = \sum_{i=1}^{k} c_{2,i} \hat H_{i, 3}
$$

In addition, the point values of any zero points outside $\alpha_j$ at $F_2(x)$ can be computed using the matrix $\hat H$ :

$$
F_2\left(\alpha_j\right)=\sum_{i=1}^{k} c_{2, i} f^{(i)}\left(\alpha_j\right)=\sum_{i=1}^{k} c_{2, i} \hat H_{i, j} \tag{E2}
$$

{: .success}
**Step 3. Solve for a set $\\{\alpha_4, \alpha_5, \cdots, \alpha_{k}\\}$**

From the expressions of (F1) and (F2) as well as the known non-zero point values of (E1) and (E2) at $\alpha_4, \alpha_5, \cdots, \alpha_{k}$ , we obtain:

$$
\begin{aligned}
\frac{F_1\left(\alpha_j\right)}{F_2\left(\alpha_j\right)} & =\frac{a_1\left(\alpha_j-\alpha_1\right)\left(\alpha_j-\alpha_{k+1}\right) \cdots\left(\alpha_j-\alpha_{2(k-1)}\right)}{a_2\left(\alpha_j-\alpha_2\right)\left(\alpha_j-\alpha_{k+1}\right) \cdots\left(\alpha_j-\alpha_{2(k-1)}\right)} \\
& =\frac{a_1\left(\alpha_j-\alpha_1\right)}{a_2\left(\alpha_j-\alpha_2\right)}
\end{aligned}
$$

Given the known assumptions $\alpha_1=1, \alpha_2=0$ , the above equations can be easily solved to give

$$
\alpha_j=\frac{a_1 / a_2}{a_1 / a_2-F_1\left(\alpha_j\right) / F_2\left(\alpha_j\right)} \quad 4 \leq j \leq k
$$

In fact, $j$ can take any value $j \notin \\{1, 2, k + 1, k+2, \cdots, 2k - 2\\}$ .

{: .success}
**Step 4. Solve for the complete solution $\\{\alpha_1, \alpha_2, \cdots, \alpha_{n}\\}$**

In fact, if the number of $\alpha_j$ obtained in the previous step is greater than $k$ , the complete coefficients of $F_1(x)$ and $F_2(x)$ can be directly recovered via Lagrange interpolation, thus allowing us to find the unknown zero points $\alpha_j, j \in \\{1, 2, k + 1, k+2, \cdots, 2k - 2\\}$ . Since we do not know the correct order of these roots, this is not sufficient to recover a correct set of solutions.

To obtain a complete solution, similarly, we can solve for the unknown points $\alpha_j, j \in k + 1, k+2, \cdots, 2k - 2$ using the functions $F_3(x)$ and $F_4(x)$ formed by the column vectors $\\{1,3, 4, \cdots, k\\}$ and $\\{2,3, 4, \cdots, k\\}$ . The general approach is to each time add the known corresponding column vectors of $\alpha_j$ into the kernel space to solve for $F(x)$ , gradually restoring the complete vector $\alpha$ .

{: .warning}
**Remarks**: (a) Having a value of 0 at $\alpha_3 = \infty$ implies that the leading term is 0, meaning the coefficient of $x^{k-1}$ is 0, thus reducing the highest degree to $k - 2$ . (b) The time complexity of the above attack algorithm is $\mathcal{O}(n^3)$ !


### General Solution for GRS

Consider the general form where $\beta_i \ne  1$ ,

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

By multiplying $\bar H$ by $\beta_1^{-1}$ and multiplying $\bar S$ by $\beta_1$ , we can always make the $\beta$ multiplier in the first column equal to 1. Therefore, we can assume without loss of generality that $\beta_1 = 1$ .

Consider the kernel space

$$
\begin{aligned}
\left\langle\mathbf{c}_1, \beta_1 f^{(i)}\left(\alpha_1\right)\right\rangle & =0, \\
& \vdots \\
\left\langle\mathbf{c}_1, \beta_{2(k - 1)} f^{(i)}\left(\alpha_{2(k-1)}\right)\right\rangle & =0 .
\end{aligned} \tag{K}
$$

The introduction of non-zero constants will not affect the structure of the kernel, and the resulting $F_1(x)$ will still satisfy the following form:

$$
F_1(x)=a_1\left(x-\alpha_1\right)\left(x-\alpha_{k+1}\right) \cdots\left(x-\alpha_{2(k-1)}\right) \tag{F1}
$$

That is, the introduction of $\beta_i$ only changes the value of $c_i$ , but does not affect the function $F_1$ . Therefore, after recovering all $\\{\alpha_1, \alpha_2, \cdots, \alpha_{n}\\}$ , we consider recovering the $\beta$ vector.

Since the information of $\beta$ is distributed in the matrix in a manner opposite to that of $\alpha$ , here we consider the kernel space of $k$ groups of $k+1$ dimensional row vectors, taking dimensions $1, 2, \cdots, k+1$ as an example. From the matrix perspective of the equation, the key point is to utilize the linear independence of $f_i$ to eliminate the effect of the coefficient matrix $S_{k \times k}$ :

$$
\begin{gathered}
\sum_{j=1}^{k+1} c_j \beta_j f^{(i)}\left(\alpha_j\right)=0 \quad 1 \leq i \leq k \\
\Longleftrightarrow \\
S \cdot V\left(\alpha_1, \ldots, \alpha_n\right) \cdot \operatorname{Diag}(\mathbf{c}) \cdot \mathbf{\beta} =0 \\
\Longleftrightarrow(S \text { is invertible }) \\
V\left(\alpha_1, \ldots, \alpha_n\right) \cdot \operatorname{Diag}(\mathbf{c}) \cdot \mathbf{\beta} =0
\end{gathered}
$$

Where $V\left(\alpha_1, \ldots, \alpha_n\right)$ is a $k \times n$ partial Vandermonde matrix, $\mathbf{\beta}$ is the vector $(\beta_1, \cdots, \beta_{k+1})$ , and $\mathbf{c}$ is the vector of the kernel space, which can be computed using the matrix $\hat H$ (the kernel space of $k$ groups of $k+1$ dimensional row vectors).

Fixing $\beta_1 = 1$ , the above $k$ groups of equations generate a unique solution. By repeating the above process, we can recover the complete $\bar \beta = (\beta_1, \cdots, \beta_{n})$ vector.

&nbsp;

{: .warning}
**Remarks**: The rational transformation yields the encoding matrix

From special solutions to general form solutions, the aforementioned solution form is $\alpha = \\{1, 0, \infty, \alpha_4, \alpha_5, \cdots, \alpha_{k}\\}$ , such solutions cannot form a verification matrix. Therefore, after obtaining this form of solution, we can obtain a set of true solutions through rational transformations.

Selecting a random element $r \in \mathbb{F}_q$ that is distinct from the elements in $\alpha$ , we perform the following rational transformation to obtain a set of positive solutions:

$$
\alpha^\prime:=  \{\alpha_j^\prime = \frac{1}{r - \alpha_j}\}
$$

{: .error}
**About $\infty$**: In finite fields, $\infty$ does not exist. Therefore, we need to unify the treatment of $\infty$ with finite field elements. In projective geometry, we extend the affine line $\mathbb{A}^1$ over the finite field $\mathbb{F}_q$ to the projective line $\mathbb{P}^1$ . The projective line $\mathbb{P}^1$ includes all points on the affine line and an additional point at infinity $\infty$ . This seems to be a somewhat tricky aspect of polynomials over finite fields. The author did not delve deeply into this; according to limit theory, $f(\infty)$ is dominated by the leading coefficient, and intuitively, its value only relates to the leading coefficient. Given the degree of the polynomial and all its roots, with the leading coefficient being the only unknown, introducing the point at infinity can quickly determine the leading coefficient of the polynomial. Thus, letting $\alpha_3 = \infty$ can completely determine the factorization form of the polynomial.

## Sagemath Implementation

The repository for implementing the above encryption algorithm using Sagemath 10.3: [Code-Based-Cryptography](https://github.com/tl2cents/Code-Based-Cryptography).

---