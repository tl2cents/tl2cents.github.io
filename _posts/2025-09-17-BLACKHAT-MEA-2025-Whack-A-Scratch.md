---
tags: Writeup Legendre-Symbol
title: BLACKHAT MEA 2025 Whack-A-Scratch
published: True
---

{: .info}
**tl;dr:** I tried the intended solution after the game. An impressive challenge about linear algebra and Legendre symbol.

<!--more-->



## Challenge Setup

Let $p = 2^{21} - 9$ and $n = 6$. There are 3 main outer matrices if size $n \times n $:

$$
\begin{cases}
A \in_{R} \mathbf{GL}(\mathbb{F}_p, n) \\
B \in_{R} \mathbf{GL}(\mathbb{F}_p, n) \\
C = A \cdot S \cdot B
\end{cases}
$$

The inner matrix $S$ is structured as:

$$
S = S_0 \cdot S_1 = 
\begin{bmatrix}
s_1 & X_{1,2} & \cdots & X_{1,n} \\
 & s_{2} & \cdots  & X_{2,n} \\
 &  & \ddots & \vdots \\
 &  &  & s_n
\end{bmatrix}^{q_1}
\cdot 
\begin{bmatrix}
s_{n+1} &  & &  \\
Y_{2,1} & s_{n+2} & & \\
\vdots & \cdots & \ddots & \\
Y_{n, 1} & \cdots &  Y_{n, n-1} & s_{2n}
\end{bmatrix}^{q_2}.
$$

We are going to recover the secret diagonal values of $S_0, S_1$: $(s_0, s_1, \cdots, s_{2n})$.  When $S$ is resampled, only $q_1$ and $q_2$  are resampled. There are two oracles:

- **Scratch**: sample a random vector $k \in \mathbb{F}_p^{n}$ and leak three vectors:
  
  $$
  \begin{cases}
  r = A^{-1} \cdot k \\
  s = k^T \cdot B^{-1} \\
  t = C \cdot A \cdot k \text{ or }  C \cdot B \cdot k 
  \end{cases} 
  \tag{SO}
  $$

  Consider a $2n$-bit mask $j$ with Hamming weight $n$, which determines the vector $t$. Specifically, if the $i$-th bit of $j$ satisfies $j_i = 1$, then $t_i = C \cdot A \cdot k$; otherwise, $t_i = C \cdot B \cdot k$. After $2n$ Scratch oracles, $A, B, S$ will be resampled.

- **Whack**: input $i, j, k$ and the server will increase $S_k[i][j]$ by one. This allows us to increase one element by one in static matrices $S_0, S_1$.



## Recover $j$ and matrix product

We define one round as 12 calls to the Scratch oracle, during which $A, B, C$, and $S$ remain fixed. There are only $\binom{2n}{n} = 924$ possible values of $j$. Assuming that we have guessed the correct $j$, denote $R_0, S_0, T_0, K_0 \in \mathbf{GL}(\mathbb{F}_p, n)$ as the matrix spanned by $r_i,s_i, t_i, k_i$ with $j_i = 0$ and $R_1, S_1, T_1, K_1$ as the matrix spanned by $r_i,s_i, t_i, k_i \in \mathbf{GL}(\mathbb{F}_p, n)$ with $j_i = 1$ , respectively.

By equation (SO), we can learn that:

$$
\begin{cases}
A \cdot R_i = K_i, & i = 0, 1 \\
S_i \cdot B = K_i^T, & i = 0, 1 \\
T_1 = C \cdot A \cdot K \\
T_0 = C \cdot B \cdot K
\end{cases}
$$

Thus, the following four matrices can be recovered:

$$
\begin{cases}
M_1 := C \cdot A \cdot A =  T_1 \cdot R_{1}^{-1} \\
M_2 := C \cdot B \cdot A =  T_0 \cdot R_{0}^{-1} \\
M_3 := C \cdot A \cdot B^T =  T_1 \cdot S_{1}^{-1} \\
M_4 := C \cdot B \cdot B^T =  T_0 \cdot S_{0}^{-1} \\
\end{cases} \tag{M}
$$

Since $\det (M_2) = \det(M_3) \implies \det(R_0) \det(T_1) = \det(T_0) \det(S_1)$, we can use this equation to determine the correct value of $j$ and also the four matrices defined in equation (M).

<section class="success" markdown="1">
**Remarks**

A natural question is whether $A, B$, and $C$ can be fully recovered from the above matrix. This problem appears to be related to solving multivariate quadratic equations, which is known to be NP-hard. It's easy to see that:

$$
A^2 \cdot M_1^{-1} \cdot M_4 = X^T \cdot A^T \cdot A \cdot X.
$$

where $X := R_0 \cdot S_0 ^ {-1} = A^{-1} \cdot B^T$. 

Solving above matrix equation is equal to solving a multivariate quadratic system with $36$ variables and $36$ equations. This seems infeasible.

</section>

## Recover diagonal values $s_i$

Span equation $\det(M_2) = \det(T_0) / \det(R_0)$, we have:

$$
\begin{aligned}
\det(T_0) / \det(R_0) &= \det(A) \det(S) \det (B) \det(B) \det(A) \\
&= \det(A)^2 \det(B)^2 \left(\prod_{1}^{n} {s_i}\right)^{q_1} \left(\prod_{n + 1}^{2n} {s_i}\right)^{q_2}
\end{aligned}
$$

The most crucial part of this problem lies in taking the Legendre symbol regarding $p$ denoted as $\textsf{leg}(\cdot)$ of both sides. This automatically eliminates all squared terms, which reveals information about the kernel $S$:

$$
\textsf{leg}\left(\frac{\det(T_0)}{\det(R_0)} \right) = \textsf{leg}\left(\left(\prod_{1}^{n} {s_i}\right)^{q_1} \left(\prod_{n + 1}^{2n} {s_i}\right)^{q_2} \right)
$$

We will not discuss the case that for some $i$, $s_i = 0$ since it's negligible.  Denote $\ell_1 =  \textsf{leg}\left(\prod_{1}^{n} {s_i}\right)$ and $\ell_2 =  \textsf{leg}\left(\prod_{n+1}^{2n} {s_i}\right) $. Denote the round constant (the left side) as $d_i$ for round $i$. Define a good state as $\ell_1= 1$ and $\ell_2 = 1$. Such a good state can be detected when the round constant $d_i$ is always $1$. 

Without the loss of generality, we assume the initial state is a good state denoted as $\mathcal{S}_0 = 1$ (and bad state denoted as $\mathcal{S}_0 = -1$). Let $m$ be the number of round trials. We can recover  a secret diagonal value $s$ as follows:

<section class="error" markdown="1">
- **Step 1**: call one Whack oracle on $s$ and then $12m$ Scratch oracles. This will generates $m$ round constants: $d_1, d_2, \ldots, d_m$. If any $d_i$ is $-1$, it means the current state is bad, i.e., $\mathcal{S}_1 = -1$. Otherwise (all $d_i$s are 1), it means the current state is good, i.e., $\mathcal{S}_1 = 1$. If $\mathcal{S}_1 \ne \mathcal{S}_0$,  it must be that $\textsf{leg}(s + 1) = 1-\textsf{leg}(s)$. Otherwise $\textsf{leg}(s + 1) = \textsf{leg}(s)$.
- ......
- **Step $i+1$**: call one Whack oracle on $s$ and then $12m$ Scratch oracles. Similarly, determine the current state $$\mathcal{S}_{i+1}$$. If $$\mathcal{S}_{i+1} \ne \mathcal{S}_{i}$$,  it must be that $$\textsf{leg}(s + i + 1) = 1 - \textsf{leg}(s + i)$$. Otherwise $$\textsf{leg}(s + i + 1) = \textsf{leg}(s + i)$$.
</section>

&nbsp;

This actually leaks a sequence of Legendre symbols $\left( \textsf{leg}(s), \textsf{leg}(s+1), \textsf{leg}(s+2), \textsf{leg}(s +3), \ldots \right)$ to us, which can be used to determine the unique value of original $s$. To be specific, we choose $M$ as the sequence length, slightly greater than $21$. Since $p = 2^{21} - 9$ is small, we can precompute all Legendre symbols for $x \in [0, p-1]$ in a table. By guessing the value of $\textsf{leg}(s)$, we have two candidates of Legendre sequence and only one matches the correct start point $s$.
