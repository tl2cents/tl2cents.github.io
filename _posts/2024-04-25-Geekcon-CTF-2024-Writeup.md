---
title: Geekcon CTF 2024 Writeup
tags: CTF Writeup Cryptography ZKP
published: True
---

{: .info}
**tl;dr:** Writeups for Geekcon CTF 2024, including challenges `ZkMaze` and all "real" crypto challenges. I ended up in 10th place and really appreciated the challenges. The topics related to the crypto challenges are HNP, RSA and bilinear map.

<!--more-->



## ZkMaze

{: .success}
**Challenge Info**: I made a maze, I think no one can reach the target...Right? flag format flag{.*}. [Attachment](/assets/ctf-stuff/2024-geekcon/ZkMaze_b5c6fb7f75478ea5b334d53d067e097b.7z)


After auditing the codes of circom circuit, we can find extremely unsafe operations in `CheckInMaze` template：



``` c
template checkInMaze(n) {
    signal input pos_x;
    signal input pos_y;
    signal output out;
    signal tmp_x;
    signal tmp_y;
    tmp_x <-- pos_x >= 0 && pos_x < n;
    tmp_x * (tmp_x - 1) === 0;    
    tmp_y <-- pos_y >= 0 && pos_y < n;
    tmp_y * (tmp_y - 1) === 0;
    out <== tmp_x * tmp_y;
}
```



`<-- ` is used and the values of `tmp_x` and `tmp_y` are hence not constrained in the final r1cs of proof. It means we can assign arbitrary values to `tmp_x` and `tmp_y` and generate a new proof for the modified circuit which can still be verified by the verifier of the original circuit.

Therefore, we fix `tmp_x = 1` and `tmp_y=1` and in this case `CheckInMaze` always settles!



```c
template checkInMaze(n) {
    signal input pos_x;
    signal input pos_y;
    signal output out;
    signal tmp_x;
    signal tmp_y;
    tmp_x <-- 1;
    tmp_x * (tmp_x - 1) === 0;    
    tmp_y <-- 1;
    tmp_y * (tmp_y - 1) === 0;
    out <== tmp_x * tmp_y;
}
```



The target maze (`#` represents for barrier and `S` represents for road):



```bash
S#S##
S##SS
S###S
#S##S
#S##S
```



Now we can run out of the $5 \times 5$ maze and reach to our target point from outside!

 ```bash
  R#S##
  R##SS
 RR###S
 R#S##S
 R#S##R
 RRRRRR
 ```



Our solution will be `input.json`:

``` python
{
    "goal": "24",
    "maze": [
        ["0", "1", "0", "1", "1"],
        ["0", "1", "1", "0", "0"],
        ["0", "1", "1", "1", "0"],
        ["1", "0", "1", "1", "0"],
        ["1", "0", "1", "1", "0"]
    ],
    "answer": ["3", "3", "0", "3", "3", "3", "1", "1", "1", "1", "1", "2", "6", "6", "6"]
}
```



Use the modified circuit to generate a valid witness `witness.wtns`, and then generate a proof:



```bash
$ snarkjs groth16 prove circuit1.zkey witness.wtns proof.json public.json
```



## BabyPairing

{: .success}
**Challenge Info**: I believe a larger space is good for security. I am testing my PKE instance with a short paragraph. The flag is of the format `flag{a_sentence_replacing_all_spaces_with_underlines}`. [Attachment](/assets/ctf-stuff/2024-geekcon/babypairing_da1629e81076583b7e19ff8bdec59654.tar.gz)


The public curve parameters are:



```python
p = 74952228632990620596507331669961128827748980750844890766694540917154772000787
a = 7527668573755289684436690520541820188297794210531835381305219764577170135028
b = 23620438740221081546022174030845858657033205037887915215836562897142269481377
F_p = GF(p)
F_p2 = GF(p^2)
a,b = F_p2(a),F_p2(b)
E = EllipticCurve(F_p2,[a,b])
g = E.random_element()
sk = F_p.random_element()
pk = g*sk
```



We are working on curve $E: y = x^3 + ax + b$ defined in $\mathbb{F}_{p^2}$ and the embedding degree of curve $E$ is 1, making it pairing-friendly! Denote the generator and public key as $G$ and $PK = [sk]G$ respectively,  the encryption of a given point $P \in E$​ is as follows:


$$
\textsf{ENC}_r(P) = ([r]G, [r]PK + P) = (C_1, C_2)
$$


where $r$ is chosen randomly.

One can verifies $P = C_2 - [sk]C_1 = P$ quickly by substituting $PK$ with $[sk]G$. Back to our challenge, we are given encryption of file `test_passage.txt`. Note that for the same character `c`, it's encoded to a fixed point $P(c)$ and then encrypted to $\textsf{ENC}_r(P(c))$.  

Can we distinguish ciphertext from the same plaintext? That is to say,  given two ciphertexts of a fixed point $P$​ :


$$
\textsf{ENC}_{r_1}(P) = ([r_1]G, [r_1]PK + P) = (C_{11}, C_{12}) \\
\textsf{ENC}_{r_2}(P) = ([r_2]G, [r_2]PK + P) = (C_{21}, C_{22})
$$


Can we distinguish it from ($P_1 \ne P_2$​):


$$
\textsf{ENC}_{r_1}(P_1) = ([r_1]G, [r_1]PK + P_1) = (C_{11}^\prime, C_{12}^\prime) \\
\textsf{ENC}_{r_2}(P_2) = ([r_2]G, [r_2]PK + P_2) = (C_{21}^\prime, C_{22}^\prime)
$$



The answer is yes by the bilinear map or pairing (more frequently used in pairing-friendly cryptography and zero-knowledge proof). Denote $e$ as the pairing $(E, E) \mapsto \mathbb{F}_{p^2}$:


$$
e([a]G, [b]G) = e(G, G)^{ab}
$$


Given $C_{11}, C_{12}, C_{21}, C_{22}$​ :


$$
\begin{aligned}
C_{22} - C_{12} &= [r_2 - r_1]PK\\
&=[sk(r_2-r_1)]G\\
C_{21} - C_{11} &= [r_2 - r_1]G
\end{aligned}
$$


Construct pairing:


$$
\begin{aligned}
e(C_{22} - C_{12}, G) & = e([sk(r_2-r_1)]G, G)\\
& =  e(G, G)^{sk(r_2-r_1)}\\
e(C_{21} - C_{11}, PK) & = e([(r_2-r_1)]G, [sk]G) \\
& =  e(G, G)^{sk(r_2-r_1)}

\end{aligned}
$$


This derives $e(C_{22} - C_{12}, G) = e(C_{21} - C_{11}, PK)$. It is an effective ciphertext distinguisher which we can use to reduce the original decryption problem in $E$​ to the decryption problem of `ascii` substitution cipher! We can decrypt most of the characters through frequency attack.

Finally we can get ciphertext like:

```python
abcdefghijkibldmfdndodfjbfpamqdkaorshndfsbatatodmjkhgcdcuobdkdmvtjmrbkmkabavtbfawdnmkavmfnmkhgibgdjxrkydvhcdsdzlksdzlkydvhcdcufatkchfawkAdvhcdrdmokmfjkhufjdBmjdkqmkCekyrdmvtchcdfabkqodBbhekrdagidzabfpibldmkfhsgimldbfxsbfadokahDcsdmodyhofsdpohEsdidmofEdihndsdkegFdosdGhrmfjsdmpdmkEdGheofdratohepwibgdheoqdokHdvabndkBtmfpdheoqobhDbaIdkCtbgamfjheoefjdDkamfjbfpjdzqdfksdvhcdbfauatdshoijmkyimflvmfnmkdCmfjidxndmkydmeabgeiJrvhcqidKcmkadoqbdvdkabcdbCatdmoabkaLtmakwmqdkeCmiJgimpMrheNtmndNghefjOatdNybibfdmoOqmbobfpNahPyodmlNjQtNmkCecqabhfR
```

Put it in [quipqiup](https://quipqiup.com/) and solves for the flag.

<details class="exploit">
<summary><b>Exploit</b></summary>
<div markdown="1">

``` python
import os
from Crypto.Util.number import long_to_bytes,bytes_to_long
p = 74952228632990620596507331669961128827748980750844890766694540917154772000787
a = 7527668573755289684436690520541820188297794210531835381305219764577170135028
b = 23620438740221081546022174030845858657033205037887915215836562897142269481377
F_p = GF(p)
F_p2 = GF(p^2)
a,b = F_p2(a),F_p2(b)
E=EllipticCurve(F_p2,[a,b])
# g=E.random_element()
# sk=F_p.random_element()
# pk=g*sk


def load_element(x1,x2):
    is_positive=(x1<p)
    x = F_p2([x1,x2])
    y2 = x^3+a*x+b
    if y2^((p^2-1)//2)==F_p2(-1):
        return None
    else :
        tmp = y2.square_root()
        #print((int(tmp)>(p-1)//2),is_positive)
        if (int(tmp[0])>(p-1)//2) ^^ is_positive : return E(x,tmp)
        else: return E(x,-tmp)

def compress_element(P):
    x,y=P.xy()
    return (int(x[0]),int(x[1])) if int(y[0])<=(p-1)//2 else (int(x[0])+p,int(x[1]))

def int_to32(x,l=17):
    b32dict="0123456789abcdefghijklmnopqrstuv"
    ret = ""
    while x>0:
        ret = b32dict[x%32]+ret
        x=x//32
    return "0"*max(0,l-len(ret))+ret

def enc_element(P):
    r = F_p.random_element()
    c2 = g*r
    c1 = pk*r+P
    ce1,ce2 = compress_element(c1),compress_element(c2)
    return "%065x%065x%065x%065x\n"%(*compress_element(c1),*compress_element(c2))
    #return int_to32(ce1[0])+int_to32(ce1[1])+int_to32(ce2[0])+int_to32(ce2[1])

def enc_str(s):
    enc_map,ret = {},""
    for c in s :
        if c in enc_map:
            cF_p2=enc_map[c]
        else :
            prefix = os.urandom(29)+bytes(c,encoding='ascii')
            x1 = int(F_p.random_element())
            for i in range(256):
                cF_p2 = load_element(x1,bytes_to_long(prefix+bytes([i])))
                if cF_p2!=None:
                    enc_map[c]=cF_p2
                    break
        ret = ret+enc_element(cF_p2)
    return ret

def dec_element(ct):
    c11,c12,c21,c22=[ct[i*65:i*65+65] for i in range(4)]
    C1,C2=load_element(int("0x"+c11,16),int("0x"+c12,16)),load_element(int("0x"+c21,16),int("0x"+c22,16))
    P=C1-C2*sk
    return (compress_element(P)[1]&0xffff)>>8

def pairing(g1, g2, n=None):
    if n is None:
        n = g1.order()
    return g1.weil_pairing(g2, n)

def compare_ct_equal(c1, c2, G, pk, n):
    c11,c12,c21,c22 = [c1[i*65:i*65+65] for i in range(4)]
    ct1 = load_element(int("0x"+c11,16),int("0x"+c12,16)),load_element(int("0x"+c21,16),int("0x"+c22,16))
    
    c11,c12,c21,c22 = [c2[i*65:i*65+65] for i in range(4)]
    ct2 = load_element(int("0x"+c11,16),int("0x"+c12,16)),load_element(int("0x"+c21,16),int("0x"+c22,16))
    
    r1G = ct1[1]
    r1xG_P = ct1[0]
    r2G = ct2[1]
    r2xG_P = ct2[0]
    T1 = pairing(r1xG_P - r2xG_P, G, n)
    T2 = pairing(r1G - r2G, pk, n)
    return T1 == T2

# print("g = load_element(*"+str(compress_element(g))+")")
# print("pk = load_element(*"+str(compress_element(pk))+")")
g = load_element(*(29278822809335293856257839032454656006652898948724335358857767737708161772420, 4396426956433009559948787995869502944693089612343852188342374458334039665950))
pk = load_element(*(148673571405127568767045322546948264768210305253661849398897382818523458361167, 23902769016595610010920651447268476259469689719718232568266731055385481225779))
# embedding degree is 1
assert (p**2 - 1) % g.order() == 0, "embedding degree is not 1"

print(f"[+] {pairing(g, pk, p+1) = }")


enc = open("./ciphertext").readlines()
enc_map = {}
Ls = []
for line in enc:
    Ls.append(line)

table = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' + ' '
cnt = 0
while len(Ls) > 0:
    print(f"[+] left {len(Ls)}")
    ct0 = Ls[0]
    Ls.remove(ct0)
    enc_map[ct0] = table[cnt]
    for ct in Ls:
        check = compare_ct_equal(ct0, ct, g, pk, p+1)
        if check:
            enc_map[ct] = table[cnt]
            Ls.remove(ct)
    cnt += 1
    
msg = [enc_map[ch] for ch in enc]
s = ''.join(msg)
print(f"[+] {s = }")
```

</div>
</details>

## HNP

{: .success}
**Challenge Info**: I am suffering from Herniated Nucleus Pulposus, please help me! [Attachment](/assets//ctf-stuff/2024-geekcon/HNP_1d8ae5f9e10fbe1bd5661acc53915083.tar.xz).

It's a mixture of HNP-SUM and EHNP. A HNP solver is enough for this challenge with low probability. Therefore, I use an EHNP solver.

Let's focus on the second HNP-SUM example, given fixed $X^\prime$, $Y_1^\prime, \cdots, Y_8^\prime \le 2^{256}$ and $N \approx 2^{2048}$:


$$
Z_i = Y_i^\prime X^{\prime} \mod N
$$


We have multiple chunk leaks of $Z_i$ including the 341 least significant bits. This is exactly the HNP-SUM problem described in [The Hidden Number Problem with Small Unknown Multipliers: Cryptanalyzing MEGA in Six Queries and Other Applications](https://eprint.iacr.org/2022/914.pdf) and we can solve for $Y_1^\prime, Y_2^\prime, \cdots, Y_8^\prime$ using lattice. Since we have 8 HNP equations and each equation leaks 341 least significant bits of $Z_i$,  intuitively we can solve for the full $X^{\prime}$ using a classic HNP-solver. 



However, if we only use the  341 least significant bits, this does not work since $Y_i^\prime$ is small.  Thinking of which part of $X^{\prime}$ affects the 341 least significant bits of $Z_i$? Let's split $X^{\prime}$ to 3 parts: 


$$
X^\prime =  \underbrace{X[0:256] * 2^{2048 - 256}}_{A_1} +  \underbrace{X[256: -341] * 2^{341}}_{A_2} + \underbrace{X[-341:]}_{A_3}
$$


Then:


$$
Y_i^\prime X^{\prime} = A_1Y_i^\prime +  A_2Y_i^\prime +  A_3Y_i^\prime  \mod N
$$


Notice that $A_2Y_i^\prime \le N$ and $A_2 Y_i^\prime \equiv 0 \mod 2^{341}$,  $A_2$ is almost independent of the 341 least significant bits of $Y_i X^{\prime}$. I guess this is the reason that we cannot recover the full $X^\prime$. Luckily, we can still recover most bits of $A_1, A_3$ mentioned above i.e. 256 most significant bits and 256 least significant bits of $X^\prime$. This is enough to recover the original $X$​​ by constructing an EHNP lattice of :


$$
X^{\prime}_i = Y_i X\mod N, \quad i \in[1..8]
$$



Actually, my solver only needs the 341 lsb leaks for solving the whole challenge, which is obviously unintended. After recovering the  256-bit $Y_i^\prime$ from HNP-SUM, we can recover both the 256 least significant bits and 256 most significant bits of  $X^\prime$ since $Y_i^\prime$ is too small compared to modulo. Using these leaks of 8 samples to construct an EHNP lattice, we can solve for the hidden $X$ with high probability. (HNP solver also works but with low probability).



<details class="exploit">
<summary><b>Exploit</b></summary>
<div markdown="1">

```python
from Crypto.Util.number import *
from random import *
from pwn import remote, process, context, log
from pwnlib.util.iters import mbruteforce
from string import ascii_letters, ascii_lowercase, digits
from hashlib import sha256
from sage.all import matrix, ZZ, QQ, lcm, load, Matrix, vector, inverse_mod, gcd

def eliminate_x_lsb(A0_inv, A1, B0, B1, mod, leak_bits):
    # mask = 2**leak_bits
    # A0 x = B0 + b0 * mask
    # A1 x = B1 + b1 * mask
    # A1(B0 + b0 * mask) = A0(B1 + b1 * mask)
    # A1 * A0^{-1} * (B0 + b0 * mask) = B1 + b1 * mask
    # (A1 * A0^{-1} * B0 - B1) + (A1 * A0^{-1} * mask) b0 =  mask * b1
    # (A1 * A0^{-1} * B0 - B1) * mask^{-1} + (A1 * A0^{-1}) b0 =  b1
    # C + D * b0 = b1
    # A0_inv = ZZ(inverse_mod(A0, mod))
    assert mod % 2 == 1, "even prime is not supported"
    mask = 2 ** leak_bits
    mask_inv = ZZ(inverse_mod(mask, mod))
    C = (A1 * A0_inv * B0 - B1) * mask_inv % mod
    D = A1 * A0_inv
    return C , D

# in this improved solver, the mod must be odd (prime)
def solve_hnp_lsb_improved_odd(As, Bs, mod, leak_bits, unknown_bits=None, bkz = None):
    # build a (n + 1)(n + 1) lattice where x is NOT in the shortest vector
    # using recentering method
    assert len(As) == len(Bs), "bad input"
    # assert all(b < 2**leak_bits for b in Bs), "leak info not valid"
    n = len(As)
    mod_bits = ZZ(mod).nbits()
    if unknown_bits is None:
        unknown_bits = mod_bits - leak_bits
    # keep array state not modified out of the function
    As = As[:]
    Bs = Bs[:]
        
    for Ai,Bi in zip(As, Bs):
        if gcd(Ai, mod) == 1:
            As.remove(Ai)
            Bs.remove(Bi)
            break
    assert gcd(Ai, mod) == 1, "no invertable element"
    A0, B0 = Ai, Bi
    A0_inv = ZZ(inverse_mod(A0, mod))
    
    Cs, Ds = [], []
    recentering_bound = 2**(unknown_bits - 1)
    for Ai,Bi in zip(As, Bs):
        C, D = eliminate_x_lsb(A0_inv, Ai, B0, Bi, mod, leak_bits)
        # C + D * b0 = bi where b0, bi in [0, 2 * recentering_bound]
        # C + D * (bi - recentering_bound) + D * recentering_bound - recentering_bound = b0 - recentering_bound
        # E = C + D * recentering_bound - recentering_bound
        # F = D
        # E + D * bi' = b0' where b0', bi' in [- recentering_bound , recentering_bound]
        E = (C + D * recentering_bound - recentering_bound) % mod
        F = D
        Cs.append(E)
        Ds.append(F)
        
    M = matrix(ZZ, n + 1, n + 1)
    M[0] = Ds + [1, 0]
    M[1] = Cs + [0, recentering_bound]    
    for i in range(n -1):
        M[i + 2, i] = mod
    
    if bkz != None:
        print(f"[*] Starting BKZ reduction with dimensions = {M.dimensions()} and  block_size = {bkz}")
        L = M.BKZ(block_size = bkz)
    else:
        print(f"[*] Starting LLL reduction with dimensions = {M.dimensions()}")
        L = M.LLL()
        
    xs = []
    for row in L:
        row_bits = [abs(ZZ(num)).nbits() for num in row[:-1]]
        if all( 1 <= rbit < unknown_bits for rbit in row_bits):
            m = row[-1]/recentering_bound
            if m not in [1,-1]:
                # print(m , row_bits)
                continue
            b0 = ZZ(row[-2])*m + recentering_bound
            x = ((B0 + (b0 << leak_bits)) * A0_inv) % mod
            # print(f"Secret candidate {x = }")
            # check
            # leaks = [(a*x % mod) % 2**leak_bits for a in As]
            xs.append(x)
            # if leaks == Bs:
            #     xs.append(x)
            #     print(f"[+] Yep! Secret Recovered (leaks checked): {x = }")
    return xs

def Babai_CVP(M, target):
    M = Matrix(QQ, M).LLL()
    target = vector(QQ, target)
    G = M.gram_schmidt()[0]
    diff = target
    for i in reversed(range(M.nrows())):
        diff -=  M[i] * ((diff * G[i]) / (G[i] * G[i])).round()
    return target - diff

delta = QQ(1/(10^8))
def EHNP(xbar, N, pis, nus, alphas, rhos, mus, betas):
    assert len(pis) == len(nus)
    assert len(alphas) == len(rhos) == len(mus) == len(betas)
    assert all(len(rho) == len(mu) for rho, mu in zip(rhos, mus))
    m = len(pis)
    d = len(alphas)
    L = sum(len(rho) for rho in rhos)
    D = d + m + L
    # print(f"{D = }, {d = }, {m = }, {L = }")
    B = [[0 for _ in range(D)] for _ in range(D)] # +1 for CVP
    # N * I_d
    for i in range(d):
        B[i][i] = N
    # A
    for j in range(m):
        for i in range(d):
            B[d + j][i] = alphas[i]*2^pis[j]
    # X
    for i in range(m):
        B[i + d][i + d] = delta / (2^nus[i])
    # rhos
    c = 0
    for i in range(d):
        for j, rho in enumerate(rhos[i]):
            B[d + m + c][i] = rho
            c += 1
    # K
    c = 0 # quick and dirty way to not have to do math
    for mu_arr in mus:
        for mu in mu_arr:
            B[d + m + c][d + m + c] = delta / (2^mu)
            c += 1

    kappa = (2^(D / 4) * (m + L)^(1/2) + 1) / 2
    # print((delta * kappa).n())
    assert 0 < delta * kappa < 1
    v = [(beta - alpha * xbar) % N for beta, alpha in zip(betas, alphas)] + [delta / 2 for _ in range(L + m)]
    W = Babai_CVP(B, v)
    xs = [(W[d + j] * 2^(nus[j])) / delta for j in range(m)]
    return ZZ(xbar + sum(xs[j]*2^(pis[j]) for j in range(m)))



MASK1 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
MASK2 = 0x1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc0000000000000000000000000000000000000000000000000000000000000000000000000000000000001fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

def gen_challenge(A, n):
    N = getPrime(A)
    X = getRandomRange(1, N)
    Y = [getRandomRange(1, N) for _ in range(n)]
    Z = [X * Y[_] % N for _ in range(n)]
    Z_s = []
    for _ in range(n):
        X_ = Z[_]
        Y_ = [(Y[_] >> (__ * B)) & MASK1 for __ in range(n)]
        Z_ = [(X_ * Y_[__] % N) & MASK2 for __ in range(n)]
        Z_s.append(Z_)
    return N, X, Y, Z, Z_s

def solve_pow(io:remote):
    # print('sha256(XXXX + {}) == {}'.format(proof[4: ], digest))
    # print('Give me XXXX:')
    io.recvuntil(b"sha256(XXXX + ")
    suffix = io.recvuntil(b") == ", drop=True)
    target_digest = io.recvuntil(b"\n", drop=True).decode()
    log.info(f"suffix: {suffix}, target_digest: {target_digest}")
    sol = mbruteforce(lambda x: sha256(x.encode() + suffix).hexdigest() == target_digest, ascii_letters + digits, 4)
    log.info(f"solved pow: {sol}")
    io.sendlineafter(b"Give me XXXX:\n", sol.encode())
    return True

def get_oracle(local=True):
    if local:
        io = process(["python3", "task.py"])
    else:
        # nc chall.geekctf.geekcon.top 40555
        io = remote("chall.geekctf.geekcon.top", 40555)
    solve_pow(io)
    return io

def get_challenge_sample(io:remote, n=8):
    N = int(io.recvline().decode().strip())
    Zs = []
    for i in range(n):
        Zs.append(eval(io.recvline().decode().strip()))
    return N, Zs

def hnp_sum_solver(a, q, E, T):
    n = len(a)
    M = matrix(ZZ, n + 1, n + 1)
    for i in range(n):
        M[i,n] = a[i]
        M[i, i] = 2*E
    M[n, n] = q
    B = M.LLL()
    
    new_E = max(E, T)
    sub_lattice = B[:(n-1),:n] / (2*E) * (2*new_E)
    sub_lattice[:, 0] /= (2 * new_E)
    t0 = None
    t0s = []
    ts = []
    for i in range(1, n):
        sub_lattice[:,i] /= (2 * new_E)
        sub_lattice = sub_lattice.LLL()
        ti, t0_alt = sub_lattice[0,0], -sub_lattice[0,i]
        if t0_alt < 0:
            t0_alt, ti = -t0_alt, -ti
        t0s.append(t0_alt)
        ts.append(ti)
        sub_lattice[:,i] *= (2 * new_E)
    t0 = lcm(t0s)
    assert t0 < T
    rts = [ZZ(t0)]
    for ti, _t0 in zip(ts, t0s):
        rts.append(ZZ(ti * (t0 // _t0)))
    return rts

def solve_challenge(N, Z_s):
    n = 8
    A = 2048
    B = A // n

    T = ZZ(2 ** 256)
    leak_bit = 341
    E = ZZ(2 ** (A - leak_bit))
    q = ZZ(N)

    recovered_Y = []
    X_leaks = []
    X_leak_bit = 256
    for ts in Z_s:
        a = [ZZ(t % 2**leak_bit) for t in ts]
        a_ = [ZZ(t % 2**leak_bit) * inverse(2**leak_bit, N) % N for t in ts]
        ys = hnp_sum_solver(a_, q, E, T)
        rY = ZZ(ys, base=2**256)
        ys_ = [ZZ(y) for y in ys]
        sol = solve_hnp_lsb_improved_odd(ys_, a, N, leak_bit)[0]
        x_msb = (sol>>(2048 - X_leak_bit)) << (2048 - X_leak_bit)
        x_lsb = sol % 2**X_leak_bit
        X_leaks.append(x_msb + x_lsb)
        recovered_Y.append(rY)  
    
    d = n
    xbar = ZZ(0)
    p = ZZ(N)
    Pi = [ZZ(0)]
    Nu = [ZZ(2048)]
    Alpha = [ZZ(y) for y in recovered_Y]
    rho = [ZZ(2**X_leak_bit)]
    mu = [ZZ(2048 - X_leak_bit * 2)]
    RHO =[rho[:] for i in range(d)]
    MU =[mu[:] for i in range(d)]
    Beta = X_leaks[:]
    unknown_bits = 2048 - X_leak_bit * 2
    rX = solve_hnp_lsb_improved_odd(recovered_Y, X_leaks, N, X_leak_bit, unknown_bits)
    log.info(f"Recovered X from hnp: {rX}")
    rX =  EHNP(xbar, p, Pi, Nu, Alpha, RHO, MU, Beta)
    return rX

while True:
    io = get_oracle(local=False)
    for i in range(3):
        N, Zs = get_challenge_sample(io)
        log.info(f"Challenge {i}")
        try:
            sol = solve_challenge(N, Zs)
            log.info(f"solution: {sol}")
            io.sendlineafter(b'X:', str(sol).encode())
            response = io.recvline().decode().strip()
            log.info(f"response: {response}")
            if response != 'Good!':
                io.close()
                break
            else:
                print(f"[*] Challenge {i} solved")
                if i == 2:
                    print(io.recvline())
                    io.close()
                    exit()
        except Exception as e:
            # log.error(f"error: {e}")
            io.close()
            break
        
# flag{HNP-SUM_i$_4_pi3ce_0f_c@ke_f0r_u}
```

</div>
</details>




## SpARse

{: .success}
**Challenge Info**: You stole Alice's RSA private key, but it is sparse, can you recover the whole key? flag is `md5sum privkey.pem | awk '{print "flag{"$1"}"}'`. [Attachment](/assets/ctf-stuff/2024-geekcon/SpARse_cd0775f5bc6763992848a7060f371efd.tar.xz)


We are given a corrupted RSA private key file in `pem` file format. We can extract as much information as possible from the PEM file. One may be confused why a 2048 bit n has to be encoded as 257 byte long which is one byte more than expected and sometimes not. This is due to the symbol bit to recognize positive and negative numbers encoded in ASN.1 DER. Due to this reason, we may need to try all possible combinations.

After decoding all the known bits, we have approximately 29.81% leaks of $p,q,d,d_p,d_q$​ :



``` bash
$ python exp.py
[+] 0.275390625% leak of d
[+] 0.291015625% leak of p
[+] 0.298828125% leak of q
[+] 0.37890625% leak of dp
[+] 0.26953125% leak of dq
[+] total leak : 0.2981770833333333%
[+] Using default e value 65537
```



This sample should be solved by the conclusion of paper : [Reconstructing RSA Private Keys from Random Key Bits](https://hovav.net/ucsd/papers/hs09.html). However, the solver from the paper does not work since the leak bits are not evenly distributed. When searching for up to 860th bit of private key, the pruning space powers since there are not enough leak bits! Notice that when 860 bits of $p$ are precisely recovered (meaning only one candidate in queue), we can run the coppersmith algorithm to factor $n$​ and recover the whole private key pem file.



You can refer to my repository [RSA-PEM-Reconstructor](https://github.com/tl2cents/RSA-PEM-Reconstructor) for detailed exploit and other related challenges. If you like it, please give me a star!



## Real or Not

{: .success}
**Challenge Info**: Are these pictures real or not? [Attachment](/assets/ctf-stuff/2024-geekcon/RealOrNot.zip)

I use the api from [sight engine](https://sightengine.com/docs/getstarted) which is accurate. It answers about 3.5s for one image and is not enough for the timer set in the server. Therefore, I used a cache-and-hit strategy to solve the challenge (guessing there are not so many images in the server). Every time we receive an image, we calculate its hash, get an answer from the api and then store a (hash, answer) pair in a dictionary. After several tries,  most of the images hit the cache dictionary and we can obtain the flag.


<details class="exploit">
<summary><b>Exploit</b></summary>
<div markdown="1">

```python
from pwn import remote, process, context, log
from pwnlib.util.iters import mbruteforce
from string import ascii_letters, ascii_lowercase, digits
from hashlib import sha256
# this example uses requests
import requests
import json
import base64
import os
import time
import zlib

def crc32(data:bytes) -> str:
    return hex(zlib.crc32(data) & 0xffffffff)[2:].zfill(8)

api_user = "**********"
api_secret = "*****************"

params = {
  'models': 'genai',
  'api_user': f'{api_user}',
  'api_secret': f'{api_secret}'
}

if not os.path.exists("./table.json"):
    table = {}
else:
    with open("table.json", "r") as fio:
        table = json.load(fio)

def check_image(img_path):
    files = {'media': open(img_path, 'rb')}
    r = requests.post('https://api.sightengine.com/1.0/check.json', files=files, data=params)
    output = json.loads(r.text)
    assert "status" in output, f"{output = }"
    assert output["status"] == "success", f"{output = }"
    prob = output["type"]["ai_generated"]
    log.info(f"ai_generated {prob = }")
    return "N" if prob > 0.5 else "Y"

# context.log_level = "DEBUG"

def solve_pow(io:remote):
    io.recvuntil(b" SHA256(solution + '")
    challenge = io.recvuntil(b"') must start with '", drop=True)
    assert len(challenge) == 16, f"{challenge = }"
    prefix = io.recvuntil(b"\n", drop=True).decode()[:-2]
    log.info(f"{challenge  = }, {prefix = }")
    diff = len(prefix)
    log.info(f"{diff = }")
    sol = mbruteforce(lambda x: sha256(x.encode() + challenge).hexdigest().startswith(prefix), ascii_letters + digits, diff + 2)
    log.info(f"solved pow: {sol}")
    io.sendlineafter(b"Enter PoW solution: ", sol.encode())
    return True

def read_image(io:remote):
    log.info(io.recvuntil(b"Is this picture real or not (Y/N)? \n").decode().strip())
    return io.recvline().decode().strip()

# nc -X connect -x instance.chall.geekctf.geekcon.top:18081 4bj3p4t84p4xwf98 1
# nc -X connect -x instance.chall.geekctf.geekcon.top:18081 7v6cweq6tp8wwmt2 1
# nc -X connect -x instance.chall.geekctf.geekcon.top:18081 fx2cec9xkk3qvk33 1
io = process(["nc", "-X", "connect", "-x", "instance.chall.geekctf.geekcon.top:18081", "fx2cec9xkk3qvk33", "1"])
assert solve_pow(io), "pow failed"
log.info(io.recvline().decode().strip())

st = time.time()
sol = ""
cached_hit = 0
for i in range(20):
    b64_dat = read_image(io)
    raw_data_bytes = base64.b64decode(b64_dat)
    fingerprint = crc32(raw_data_bytes)
    if  fingerprint in table:
        ans = table[crc32(base64.b64decode(b64_dat))]
        log.info(f"found {ans = } with cached data")
        sol += ans
        cached_hit += 1
        continue
    
    with open(f"imgs{i}.png", "wb") as fio:
        fio.write(base64.b64decode(b64_dat))
    ans = check_image(f"imgs{i}.png")
    sol += ans
    table[fingerprint] = ans
    et = time.time()
    # remove the file
    os.remove(f"imgs{i}.png")

log.info(f"cached hit: {cached_hit} / {20}")
log.info(f"round {i + 1} total time: {et - st}")

# save the table
with open("./table.json", "w") as fio:
    json.dump(table, fio)

io.sendlineafter(b"Enter your answers for all 20 rounds (Y/N): ", sol.encode())
log.info(io.recvline().decode().strip())
io.close()
```

</div>
</details>

## Real or Not Revenge

The same as `Real or Not`
