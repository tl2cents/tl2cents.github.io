---
tags: ZKP Groth16
title: "ZK-SNARK: Deep Dive into Groth16"
published: true
---

{: .info}
**tl;dr:** Groth16 is one of the most popular and efficient Zero-Knowledge Succinct Non-interactive Arguments of Knowledge (zk-SNARKs) based on Quadratic Arithmetic Programs (QAPs). This post provides a detailed walkthrough of the Groth16 protocol, covering its setup, proving, and verification phases, along with the underlying mathematical principles.

<!--more-->

Useful references:

- Groth16 paper: [On the Size of Pairing-based Non-interactive Arguments](https://eprint.iacr.org/2016/260.pdf)
- Awesome introduction to zk-snark: [moonmath book](https://github.com/LeastAuthority/moonmath-manual)


---

## Preliminaries

Before start, the basic definitions of zero-knowledge proofs and zk-SNARKs are assumed to be known, especially for Rank-1 Constraint System (R1CS) and Quadratic Arithmetic Programs. For a brief introduction, please refer to my previous post: [Notes on Formal Language and Generic Proof System](https://blog.tanglee.top/2025/03/27/Notes-on-Formal-Language-and-Generic-Proof-Representations.html). For beginners, [moonmath book](https://github.com/LeastAuthority/moonmath-manual) is highly recommended for learning the mathematical foundations and Groth16 protocol.

> **High-Level Process of Groth16.** In Groth16, the claim or knowledge to be proven is typically represented as an arithmetic circuit, then reduced to a Rank-1 Constraint System (R1CS), and finally transformed into a Quadratic Arithmetic Program (QAP). This reduction allows the proof to be distilled into a single polynomial identity. In this post, we focus exclusively on the final polynomial proof, which constitutes the core of Groth16's zero-knowledge property.

<div class="error-block" markdown="1">
<div class="block-title">Recall Quadratic Arithmetic Program (QAP)</div>
Let $$L$$ be a language defined by some Rank-1 Constraint System $$R$$ such that a constructive proof of knowledge for an instance $$<I_1, \ldots, I_n>$$ in $$L$$ consists of a witness $$<W_1, \ldots, W_m>$$. Let $$\left\{\mathbb{G}_1, \mathbb{G}_2, e(\cdot, \cdot), g_1, g_2, \mathbb{F}_r\right\}$$ be a set of Groth16 parameters where $$e(\cdot, \cdot)$$ is an efficiently computable, non-degenerate, bilinear map from $$\mathbb{G}_1\times \mathbb{G}_2$$ to some target group $$\mathbb{G}_T$$ of order $$r$$. Let $$Q A P(R)=\left\{T \in \mathbb{F}[x],\left\{A_j, B_j, C_j \in \mathbb{F}[x]\right\}_{j=0}^{n+m}\right\}$$ be a Quadratic Arithmetic Program associated to $$R$$. The string $$\left.\left(<I_1, \ldots, I_n\right\rangle ;<W_1, \ldots, W_m>\right)$$ is a solution to the R1CS if and only if the following polynomial is divisible by the target polynomial $$T$$ :

$$
\begin{aligned}
    P_{(I ; W)} = &\left(A_0+\sum_j^n I_j \cdot A_j+\sum_j^m W_j \cdot A_{n+j}\right) \cdot\left(B_0+\sum_j^n I_j \cdot B_j+\sum_j^m W_j \cdot B_{n+j}\right) \\
    &-\left(C_0+\sum_j^n I_j \cdot C_j+\sum_j^m W_j \cdot C_{n+j}\right) \\
\end{aligned}.
$$

This implies

$$
P_{(I ; W)}(x) = H(x) \cdot T(x) \text{ for some } H(x) \in \mathbb{F}[x].
$$

**The prover is going to convince the verifier that he/she knows a valid witness $$<W_1, \ldots, W_m>$$ for the instance $$<I_1, \ldots, I_n>$$ without revealing any information about the witness.**

</div>

In the following sections, this post provides a detailed exposition of the three core sub-protocols of Groth16: the Setup Phase, the Prover Phase, and the Verifier Phase. It concludes by addressing several practical security considerations essential for implementation.

## Setup Phase

The setup phase samples 5 random, invertible elements $$\alpha, \beta, \gamma, \delta$$ and $$\tau$$ from the scalar field $$\mathbb{F}_r$$ of the protocol and outputs the simulation trapdoor $$\mathrm{ST}$$ :

$$
\mathrm{ST}=(\alpha, \beta, \gamma, \delta, \tau)
$$

In the setup phase, we need to generate the following common reference string and remove the simulation trapdoor completely right after the setup phase.

{% definition title="Common Reference String" %}
$$
\begin{aligned}
& C R S_{\mathbb{G}_1}=\left\{\begin{array}{c}
g_1^\alpha, g_1^\beta, g_1^\delta,\left(g_1^{\tau^j}, \ldots\right)_{j=0}^{\operatorname{deg}(T)-1},\left(g_1^{\frac{\beta \cdot A_j(\tau)+\alpha \cdot B_j(\tau)+C_j(\tau)}{\gamma}}, \ldots\right)_{j=0}^n \\
\left(g_1^{\frac{\beta \cdot A_{j+n}(\tau)+\alpha \cdot B_{j+n}(\tau)+C_{j+n}(\tau)}{\delta}}, \ldots\right)_{j=1}^m,\left(g_1^{\frac{\tau^j \cdot T(\tau)}{\delta}}, \ldots\right)_{j=0}^{\operatorname{deg}(T)-2}
\end{array}\right\} \\
& C R S_{\mathbb{G}_2}=\left\{g_2^\beta, g_2^\gamma, g_2^\delta,\left(g_2^{\tau^j}, \ldots\right)_{j=0}^{\operatorname{deg}(T)-1}\right\}
\end{aligned}
$$
{% enddefinition %}

{% remark %}
- Usually $$\tau$$ is called a secret evaluation point. Let $$P(x) = \sum_{i=0}^{k}  a_i x^i$$ be a polynomial of degree $$k < \deg T$$ with coefficients in $$\mathbb{F}_{r}$$. Then we can evaluate $$P(\tau)$$ in the exponent of $$g_1$$ or $$g_2$$ given the common reference string:
  
  $$
  g^{P(\tau)} = g^{\sum_{i=0}^{k}a_i{\tau^i}} = \prod_{i=0}^{k} (g^{\tau^i})^{a_i}.
  $$

  The elements $$g^{\tau^0}_{1,2}, g^{\tau^1}_{1,2}, \ldots, g^{\tau^k}_{1,2}$$ are commonly referred to as the **Powers of Tau**.

- **Toxic Waste.** The simulation trapdoor $$\mathrm{ST}=(\alpha, \beta, \gamma, \delta, \tau)$$ is often referred to as the toxic waste of the setup phase. The simulation trapdoor can be utilized to generate fraud proofs, which are verifiable zk-SNARKs that can be constructed without knowledge of any witness, that is, forging proofs. Thus, $$\mathrm{ST}=(\alpha, \beta, \gamma, \delta, \tau)$$ must be safely deleted in the setup phase (through a trusted third party or multi-party computation).
- **Public Information for Prover/Verifier**. The R1CS, its corresponding QAP and the Common Reference String are public to the Prover and Verifier.
{% endremark %}


## The Prover Phase

We first recall that given  $$QAP(R)=\left\{T \in \mathbb{F}[x],\left\{A_j, B_j, C_j \in \mathbb{F}[x]\right\}_{j=0}^{n+m}\right\}$$  associated with our R1CS and a witness $$<W_1, \ldots, W_m>$$ for an instance $$<I_1, \ldots, I_n>$$,  the knowledge proof of  witness $$<W_1, \ldots, W_m>$$ is performed as follows. We first compute the proving polynomial:

$$
\begin{aligned}
P_{(I ; W)} &=\left(A_0+\sum_{j=1}^n I_j \cdot A_j+\sum_{j = 1}^m W_j \cdot A_{n+j}\right) \cdot\left(B_0+\sum_{j = 1}^n I_j \cdot B_j+\sum_{j = 1}^m W_j \cdot B_{n+j}\right) \\
&-\left(C_0+\sum_{j = 1}^n I_j \cdot C_j+\sum_{j = 1}^m W_j \cdot C_{n+j}\right).
\end{aligned}
$$

To be more precise, we split $$P_{(I ; W)}$$ as three parts $$\mathcal{A}, \mathcal{B}, \mathcal{C}$$:

$$
\begin{aligned}
P_{(I ; W)} &=
\underbrace{\left(A_0+\sum_{j=1}^n I_j \cdot A_j+\sum_{j = 1}^m W_j \cdot A_{n+j}\right)}_{\mathcal{A}} \cdot
\underbrace{\left(B_0+\sum_{j = 1}^n I_j \cdot B_j+\sum_{j = 1}^m W_j \cdot B_{n+j}\right)}_{\mathcal{B}} \\
&- \underbrace{\left(C_0+\sum_{j = 1}^n I_j \cdot C_j+\sum_{j = 1}^m W_j \cdot C_{n+j}\right)}_{\mathcal{C}}.
\end{aligned}
$$


Denote the degree of target polynomial $$T(x):=\Pi_{l=1}^t\left(x-m_l\right)$$ as $$t$$. By the definitions of QAP polynomials $$A, B, C, T$$, if the witness $$<W_1, \ldots, W_m>$$ is valid for an instance $$<I_1, \ldots, I_n>$$, the polynomial $$P_{(I ; W)}$$ has roots $$(m_1, m_2, \ldots, m_{t})$$ (which exactly correspond to the $$t$$ equations in R1CS) and is hence divisible by $$T(x)$$. This implies:

$$
P_{(I ; W)}(x) = H(x) \cdot T(x) \tag{F}
$$

<div class="error-block" markdown="1">
<div class="block-title">The Core of Knowledge Proof</div>

The prover has the knowledge of the polynomial factorization $$ P_{(I ; W)}(x) = H(x) \cdot T(x) $$. The Groth16 protocol does not rely on Fiat-Shamir transform. Instead, all potential 'randomness' required from the verifier is pre-generated during the trusted setup phase and remains concealed within the Common Reference String (CRS). Regarding the secret challenge point $\tau$ embedded in the CRS, the prover is merely required to demonstrate the capability to compute the following identity:

$$
\begin{cases}
  P_{(I ; W)}(\tau) = H(\tau) \cdot T(\tau) \\
  P_{(I ; W)}(\tau) = \mathcal{A}(\tau) \cdot \mathcal{B}(\tau) - \mathcal{C}(\tau)
\end{cases}
\implies \mathcal{A}(\tau) \cdot \mathcal{B}(\tau) - \mathcal{C}(\tau) = H(\tau) \cdot T(\tau)
$$

This ability implies that the prover must know the polynomial $H(x)$, which effectively signifies the possession of a valid witness. Please note that the preceding explanation focuses on the underlying principles; in practice, the Groth16 protocol incorporates random blinding factors (masks) to ensure zero-knowledge:

$$
\left( \mathcal{A}(\tau) + \alpha +  r \cdot \delta \right) \cdot \left( \mathcal{B}(\tau) + \beta +  s \cdot \delta \right) = H(\tau) \cdot T(\tau) + \mathcal{C}(\tau) - \underbrace{\cdots\cdots\cdots}_{\text{Messy Stuff}} \tag{Groth}
$$

</div>

> You can circle back to the $(Groth)$ equation after checking out the verifier phase, or keep it in mind as you follow the completeness proof. It’s the best way to grasp what’s actually happening under the hood of the Groth16 protocol. Doing this helps you see the bigger picture, rather than just grinding through a bunch of dry math only to realize at the end, 'Oh, I guess the verifier’s pairing equation works.'


By the pre-computed CRS, the prover can evaluate $$P_{(I ; W)}(\tau)/ \delta$$. We first note the all polynomials $$A_i, B_i, C_i$$ are at most of degree $$t - 1$$ since they are computed by Lagrange Interpolation on $$t$$ points with x-coordinates $$(m_1, \ldots, m_t)$$. The degree of $$H(x)$$ ($$h := \deg H \le t - 2 = \deg T - 2$$) is strictly smaller than that of $$T(x)$$. Denote $$H(x)$$ as:

$$
H(x) = H_0 + H_1 x + \cdots + H_h x^{h}.
$$

Then:

$$
\begin{aligned}
g_1^\frac{P_{(I ; W)}(\tau)}{\delta} &= g_1^{\frac{H(\tau) \cdot T(\tau)}{\delta}} \\
&= (g_1^{\frac{\tau^0 \cdot T(\tau)}{\delta}})^{H_0} \cdot (g_1^{\frac{\tau^1 \cdot T(\tau)}{\delta}})^{H_1} \cdots (g_1^{\frac{\tau^h \cdot T(\tau)}{\delta}})^{H_h}
\end{aligned}
$$



The prover samples two random field elements $$r, t \in \mathbb{F}_{r}$$ and computes the following curve points：

$$
\begin{aligned}
& g_1^W=\left(g_1^{\frac{\beta \cdot A_{1+n}(\tau)+\alpha \cdot B_{1+n}(\tau)+C_{1+n}(\tau)}{\delta}}\right)^{W_1} \cdot  \left(g_1^{\frac{\beta \cdot A_{2+n}(\tau)+\alpha \cdot B_{2+n}(\tau)+C_{2+n}(\tau)}{\delta}}\right)^{W_2} \cdots\left(g_1^{\frac{\beta \cdot A_{m+n}(\tau)+\alpha \cdot B_{m+n}(\tau)+C_{m+n}(\tau)}{\delta}}\right)^{W_m} \\
& g_1^A=g_1^\alpha \cdot g_1^{A_0(\tau)} \cdot\left(g_1^{A_1(\tau)}\right)^{I_1} \cdots\left(g_1^{A_n(\tau)}\right)^{I_n} \cdot\left(g_1^{A_{n+1}(\tau)}\right)^{W_1} \cdots\left(g_1^{A_{n+m}(\tau)}\right)^{W_m} \cdot\left(g_1^\delta\right)^r \\
& g_1^B=g_1^\beta \cdot g_1^{B_0(\tau)} \cdot\left(g_1^{B_1(\tau)}\right)^{I_1} \cdots\left(g_1^{B_n(\tau)}\right)^{I_n} \cdot\left(g_1^{B_{n+1}(\tau)}\right)^{W_1} \cdots\left(g_1^{B_{n+m}(\tau)}\right)^{W_m} \cdot\left(g_1^\delta\right)^t \\
& g_2^B=g_2^\beta \cdot g_2^{B_0(\tau)} \cdot\left(g_2^{B_1(\tau)}\right)^{I_1} \cdots\left(g_2^{B_n(\tau)}\right)^{I_n} \cdot\left(g_2^{B_{n+1}(\tau)}\right)^{W_1} \cdots\left(g_2^{B_{n+m}(\tau)}\right)^{W_m} \cdot\left(g_2^\delta\right)^t \\
& g_1^C=g_1^W \cdot g_1^{\frac{H(\tau) \cdot T(\tau)}{\delta}} \cdot\left(g_1^A\right)^t \cdot\left(g_1^B\right)^r \cdot\left(g_1^\delta\right)^{-r \cdot t}
\end{aligned}
$$

Note that all $$A_i, B_i, C_i$$ are polynomials of degree less than $$t - 1$$ and can be evaluated at $$\tau$$ by the powers of tau. In practice, $$g_1^{A_i(\tau)}, g_1^{B_i(\tau)}, g_2^{B_i(\tau)}$$ can be pre-computed. In other words, these points only need to be computed once, and can be made public and reused for multiple proof generations as they are consistent across all instances and witnesses. 

Therefore, we have:

$$
\begin{cases}
g_1^{A} = g_1^{\mathcal{A}(\tau) + \alpha + r \cdot \delta} \\
g_1^{B} = g_1^{\mathcal{B}(\tau) + \beta + t \cdot \delta} \\
g_2^{B} = g_2^{\mathcal{B}(\tau) + \beta + t \cdot \delta} \\
\end{cases}
$$

The final proof consists of only three elements:

$$
\pi = (g_1^{A}, g_1^{C}, g_2^{B})
$$


Denote the three proof elements as $$\pi:=(\pi_A, \pi_B, \pi_C)$$ in the following context. The correctness of the proof and details of verifying will be addressed in next section.



## The Verification Phase

The verifier has the knowledge of $$A, B, C, T$$, the public instance $$I_1, \ldots, I_{n}$$ and the common reference string $$CRS_{\mathbb{G}_1}, CRS_{\mathbb{G}_2}$$. The verifier computes:

$$
g_1^I=\left(g_1^{\frac{\beta \cdot A_{0}(\tau)+\alpha \cdot B_{0}(\tau)+C_{0}(\tau)}{\gamma}}\right) \cdot  \left(g_1^{\frac{\beta \cdot A_{1}(\tau)+\alpha \cdot B_{1}(\tau)+C_{1}(\tau)}{\gamma}}\right)^{I_1} \cdots \left(g_1^{\frac{\beta \cdot A_{n}(\tau)+\alpha \cdot B_{n}(\tau)+C_{n}(\tau)}{\gamma}}\right)^{I_n}.
$$


<div class="error-block" markdown="1">
<div class="block-title">The Core of Verification</div>

The verifier is able to verify the zk-SNARK proof $$\pi = (g_1^A,g_1^C, g_2^B)$$ by checking:

$$
e(g_1^A, g_2^B) = e(g_1^{\alpha}, g_2^{\beta}) \cdot e(g_1^{I}, g_2^{\gamma}) \cdot e(g_1^C, g_2^{\delta}). \tag{G}
$$

By pairing, equation $$\text{(G)}$$ is equivalent to the following equation in exponent:

$$
\begin{aligned}
A \cdot B = \alpha \beta  + \gamma I + \delta C
\end{aligned}
\tag{V}
$$

</div>


{% proof fold title="Correctness of the Pairing Check" %}

Recall that $$A, B, I, C$$ can be detailed as:

$$
\begin{cases}
\mathcal{A}(\tau) = A_0(\tau) + \sum_{j=1}^n I_j \cdot A_j(\tau) + \sum_{j = 1}^m W_j \cdot A_{n+j}(\tau)  \\
\mathcal{B}(\tau) = B_0(\tau) + \sum_{j=1}^n I_j \cdot B_j(\tau) + \sum_{j = 1}^m W_j \cdot B_{n+j}(\tau) \\
\mathcal{C}(\tau) = C_0(\tau) + \sum_{j=1}^n I_j \cdot C_j(\tau) + \sum_{j = 1}^m W_j \cdot C_{n+j}(\tau) \\
A :=  \mathcal{A}(\tau) + \alpha + r \cdot \delta \\
B :=  \mathcal{B}(\tau) + \beta + t \cdot \delta \\
\gamma I :=  \sum_{i=0}^{n} \left( \beta A_i (\tau ) + \alpha B_i (\tau) + C_i (\tau) \right) I_i, \text{ where } I_0 := 1 \\
\delta W :=  \sum_{i=1}^{m} \left( \beta A_{i + n} ( \tau ) + \alpha B_{i + n} ( \tau ) + C_{i + n} (\tau) \right) W_i \\
C := W + \frac{H(\tau) \cdot T(\tau)}{\delta} + t \cdot A + r \cdot B - r \cdot t \cdot \delta
\end{cases}
$$

Expand the right-hand side of equation $$\text{(V)}$$ as:

$$
\begin{aligned}
A \cdot B &= (\mathcal{A}(\tau) + \alpha + r \cdot \delta) \cdot (\mathcal{B}(\tau) + \beta + t \cdot \delta) \\
&= \mathcal{A}(\tau) \mathcal{B}(\tau) + (\alpha + r \cdot \delta) \mathcal{B}(\tau) + (\beta + t \cdot \delta) \mathcal{A}(\tau) + (\alpha + r \cdot \delta)  \cdot  (\beta + t \cdot \delta)
\end{aligned}
$$

Expand the left-hand side of equation $$\text{(V)}$$ as:

$$
\begin{aligned}
\alpha \beta  + \gamma I + \delta C &= \alpha \beta + \gamma I  + \delta W +  H(\tau) \cdot T(\tau) + t \delta \cdot A + r\delta \cdot B - r \cdot t \cdot \delta^2 \\
&=  \alpha \beta + \gamma I  + \delta W +  \mathcal{A(\tau)} \cdot \mathcal{B}(\tau) - \mathcal{C}(\tau) + t \delta \cdot A + r\delta \cdot B - r \cdot t \cdot \delta^2 \\
&=  \alpha \beta + \underbrace{\beta \mathcal{A}(\tau) + \alpha \mathcal{B}(\tau) + \mathcal{C}(\tau)}_{\gamma I + \delta W} + \mathcal{A(\tau)} \cdot \mathcal{B}(\tau) - \mathcal{C}(\tau) \\
&\quad + t \delta \cdot (\mathcal{A}(\tau) + \alpha + r \cdot \delta) + r\delta \cdot (\mathcal{B}(\tau) + \beta + t \cdot \delta ) - r \cdot t \cdot \delta^2 \\
&= \mathcal{A(\tau)} \cdot \mathcal{B}(\tau) +  (\alpha + r \cdot \delta) \mathcal{B}(\tau) + (\beta + t \cdot \delta) \mathcal{A}(\tau) + (\alpha + r \cdot \delta)  \cdot  (\beta + t \cdot \delta) \\
& = A \cdot B
\end{aligned}
$$

This completes the correctness proof of the verifier phase.
{% endproof %}



{% remark title="Zero-Knowledge" %}
The key of identity $$(G)$$ lies in $$P_{(I ; W)}(x) = H(x) \cdot T(x) = \mathcal{A}(x) \cdot \mathcal{B}(x) - \mathcal{C}(x)$$. The pairing actually verifies this polynomial factorization on a single unknown point $$\tau$$. The prover computes all the necessary parts of secret witness $$W_1, \ldots, W_{m}$$ used in above factorization computation for the verifier without revealing any information about the witness. 

- *Completeness* directly follows from the pairing check. 
- *Soundness* follows from hardness of discrete logarithm assumption and the observation that the values $$\tau, \alpha, \beta, \gamma, \delta$$ remains unknown. Once the simulation trapdoor is leaked, attacker can forge valid proofs and breaks the soundness.
- *Zero knowledge* follows from the indistinguishability of $$A, B$$ distributions from uniform random distributions since $$g_1^{A}, g_2^{B}$$ are masked with random values $$r, t$$. The value $$C$$ is fully determined by $$A, B$$.

{% endremark %}

## Security Considerations

In this section, we briefly discuss some security issues of Groth16 in real-world scenarios.

### The Extensibility Attacks

Given a valid proof $$\pi =(\pi_A, \pi_B, \pi_C)= (g_1^A,g_2^B,g_1^C)$$, the verifying process only checks:

$$
e(g_1^A, g_2^B) = e(g_1^{\alpha}, g_2^{\beta}) \cdot e(g_1^{I}, g_2^{\gamma}) \cdot e(g_1^C, g_2^{\delta})
$$

Therefore, for any $$x \cdot x^{-1} =1 \in \mathbb{F}_r$$, we can forge/regenerate a new proof from the known valid proof:

$$
\hat{\pi}  = (\pi_A^x, \pi_B^{x^{-1}}, \pi_C) =(
(g_1^{A})^{x},
(g_2^{B})^{x^{-1}},
g_1^C)
$$

from the pairing identity $$e(\pi_A^x, \pi_{B}^{x^{-1}}) = e(\pi_A, \pi_B)$$. This property is known as 'malleability' makes it extremely easy to double spend a proof. 

Essentially, an attacker can take an existing zero-knowledge proof and tweak it to generate a brand-new, valid one. In the world of blockchain, which is currently the primary use case for ZKPs, malleability is a deal-breaker. It’s a critical vulnerability that can pave the way for devastating issues like double-spending or double-voting attacks. 


{% plain info title="Countermeasures in Blockchain" %}

- **Sign the proof.**  The verifier also checks the signature along with the proof. 
- **Nullifier Values.** Nullifier values are unique identifiers included in the public inputs of a ZKP circuit that prevent double-spending while maintaining privacy. **One proof can only be used once with a given set of public inputs.** See Tornado-Cash as a real-world example.
- **Add identity information of the prover to the public inputs of the circuit**.
{% endplain %}


### Forging Attack With Toxic Waste

When the simulation trapdoor $$\mathrm{ST}=(\alpha, \beta, \gamma, \delta, \tau)$$ is leaked, one can forge a proof without a valid witness. This is a generic forging attack against the trusted setup zero-knowledge proof protocol.


{% plain success%}

**Attack 1: Full Leak of $$\mathrm{ST}=(\alpha, \beta, \gamma, \delta, \tau)$$**

Given an instance $$I_1, \ldots, I_n$$, we first use the common reference string to compute:

$$
g_1^I=\left(g_1^{\frac{\beta \cdot A_{0}(\tau)+\alpha \cdot B_{0}(\tau)+C_{0}(\tau)}{\gamma}}\right) \cdot  \left(g_1^{\frac{\beta \cdot A_{1}(\tau)+\alpha \cdot B_{1}(\tau)+C_{1}(\tau)}{\gamma}}\right)^{I_1} \cdots \left(g_1^{\frac{\beta \cdot A_{n}(\tau)+\alpha \cdot B_{n}(\tau)+C_{n}(\tau)}{\gamma}}\right)^{I_n}.
$$

We then choose arbitrary values $$A, B$$ and simulate a value proof from the verifying equation with the knowledge of $$\mathrm{ST}=(\alpha, \beta, \gamma, \delta, \tau)$$ as follows:

$$
\begin{cases}
\pi_A = g_1^A \\
\pi_B = g_1^{B} \\
\pi_C = g_1^{\frac{A \cdot B}{\delta}} g_1^{\frac{- \alpha \cdot \beta}{\delta}} g_1^{-\frac{\gamma}{\delta} I}
\end{cases}
$$

The verifying equation holds as follows:

$$
\begin{aligned}
e(g_1^{\alpha}, g_2^{\beta}) \cdot e(g_1^{I}, g_2^{\gamma}) \cdot e(\pi_C, g_2^{\delta}) &= e(g_1, g_2)^{\alpha  \cdot \beta + \gamma I + \delta C} \\
&= e(g_1, g_2)^{\alpha \beta + \gamma I + A \cdot B - \alpha \cdot \beta - \gamma I}\\
&= e(g_1, g_2)^{A \cdot B} = e(g_1^A, g_2^B) \\
&= e(\pi_A, \pi_B)
\end{aligned}
$$

**The forged proof will pass the verification process and is computable without the existence of a witness.** The above attack uses the full simulation trapdoor $$(\alpha, \beta, \gamma, \delta, \tau)$$ (or $$\tau$$ not used) for computing $$g^C$$ and 

{% endplain %}

{% plain warning%}

**Attack 2: Partial Leak of $$(\alpha, \beta, \tau)$$ or $$(\alpha,\gamma)$$ or $$(\beta, \gamma)$$**

We can also perform a forgery attack with only $$(\alpha, \beta, \tau)$$:

$$
\begin{cases}
\pi_A = g_1^A \\
\pi_B = g_2^{B} \\
\pi_C = g_1^{0} = 1_{\mathbb{G}_1}
\end{cases}
$$

where $$A, B$$ is chosen such that:

$$
A \cdot B = \alpha \beta +  \gamma I = \alpha \beta + \sum_{i=0}^{n} I_i \left(\beta \cdot A_{i}(\tau)+\alpha \cdot B_{i}(\tau)+C_{i}(\tau) \right)
$$

This is computable since the polynomials $$A_i(x), B_i(x), C_i(x)$$ and inputs $$I_i$$ are all public and the validity is given by:

$$
\begin{aligned}
e(g_1^{\alpha}, g_2^{\beta}) \cdot e(g_1^{I}, g_2^{\gamma}) \cdot e(\pi_C, g_2^{\delta}) &= e(g_1, g_2)^{\alpha  \cdot \beta + \gamma I + \delta \cdot 0} \\
&= e(g_1, g_2)^{\alpha \beta + \gamma I}\\
&= e(g_1, g_2)^{A \cdot B} = e(g_1^A, g_2^B) \\
&= e(\pi_A, \pi_B)
\end{aligned}
$$

Actually, we can further forge a proof with only $$(\alpha,\gamma)$$ or $$(\beta, \gamma)$$. With $$\gamma$$, we can compute:

$$
(g_1^I)^{\gamma} = g_1^{\sum_{i=0}^{n} I_i \left(\beta \cdot A_{i}(\tau)+\alpha \cdot B_{i}(\tau)+C_{i}(\tau) \right)}
$$

With $$\alpha$$ or $$\beta$$, we can compute:

$$
(g_1^{\beta})^{\alpha} = g_1^{\alpha \beta}
$$

Therefore, we can choose:

$$
\begin{cases}
\pi_A = g_1^{\alpha \beta + \gamma I} \\
\pi_B = g_2  \\
\pi_c = g_1^{0}
\end{cases}
$$

as a valid proof.
{% endplain %}




{% plain error%}

**Attack 3: Single Leak of Evaluation Point $$\tau$$**

If we know the secret evaluation point $$\tau$$, we can prove the divisibility exactly at this special point rather than proving the full polynomial factorization in the general case. In other words, the verifying process checks only the divisibility at $$\tau$$:

$$
P_{(I ; W)}(\tau) = H(\tau) \cdot T(\tau) \tag{V}
$$

For a given instance $$(I_1, \cdots, I_{n})$$, we can find a pair $$(W_1, \cdots, W_m), (H_0, \cdots, H_h)$$ with $$h \le \deg T - 1$$ by randomly choosing $$m + h$$ values of them e.g., $$W_1, \ldots, W_m, H_1, H_{h}$$ and then solving a linear equation over $$\mathbb{F}_r$$ to find $$H_0$$. The solution $$(W_1, \cdots, W_m), (H_0, \cdots, H_h)$$ to $$\textsf{Eq}.(V)$$ can used to generate a valid fake proof for instance $$(I_1, \cdots, I_{n})$$ in the standard prover phase.
Another view of attacking $$(V)$$ can be performed as follows. We generate a random witness $$(W_1, \cdots, W_m)$$ and in this case:

$$
P_{(I ; W)}(x) = H(x) \cdot T(x) + R(x) \tag{V}
$$

Reset $$\bar H(x) = H(x) + R(\tau) \cdot T(\tau)^{-1}$$, we have 

$$
P_{(I ; W)}(\tau) = H(\tau) \cdot T(\tau) + R(\tau) = \left(H(\tau) + R(\tau) \cdot T(\tau)^{-1} \right) \cdot T(\tau) = \bar H(\tau) T(\tau).
$$

Perform a standard prover phase with $$\bar H(x)$$ and $$W_1, \ldots, W_{m}$$ to forge a proof.
{% endplain %}


> In short, every single value within the simulation trapdoor must remain strictly confidential, making the security of the setup phase absolutely critical. We have to assume that the entity running this process is honest and trustworthy, which is often far too demanding for real-world applications. To make matters worse, a new setup is required for every single circuit. This is the predicament of Groth16: while it is mathematically elegant, the difficulty of guaranteeing a secure setup makes it quite cumbersome to deploy. These pain points are exactly what newer protocols like Plonk aim to solve by introducing more flexible setup procedures.
