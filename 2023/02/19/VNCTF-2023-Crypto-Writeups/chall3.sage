from Crypto.Util.number import bytes_to_long,getPrime
p = getPrime(1024)
q = getPrime(1024)
N = p * q
PR.<x,y> = PolynomialRing(Zmod(N))
Curve = lambda A,B,C,D,E,F: A*x^2 + 2 * B * x * y + C * y^2 + D * x + E * y + F 
flag = b'                                                 ' # secret
x0 = bytes_to_long(flag)
y0 = bytes_to_long(b'                                                 ') # secret too 
A1 = bytes_to_long(b'? uoy lliw .em nodnaba ,meht ekil eb lliw uoy ,os')
A2 = bytes_to_long(b'a me no o to yu ri no ka o ri pu ra i do no ta ka sa')
D = bytes_to_long(b'mu shi ta me ka na su ko e de ka i ka ba n ki ta na i ku tsu') 
E = bytes_to_long(b'                                                    ') # also secret XD

PR.<c> = PolynomialRing(Zmod(N))
f = A1 ^ 2 * x0 ^ 2 + c ^ 2 * y0 ^ 2 - A1 ^ 2 * c ^ 2
f1 = f.change_ring(Zmod(p))
f2 = f.change_ring(Zmod(q))
cp = Integer(f1.roots()[0][0])
cq = Integer(f2.roots()[0][0])
C = Integer(CRT([cp,cq],[p,q]))
F = -(A2 * x0 ^ 2 + D * x0 + E * y0 ) % N

PR.<x> = PolynomialRing(Zmod(N))
y = (A2 * x ^ 2 + D * x + F) * inverse_mod(-E,N)
f = A1 ^ 2 * x ^ 2 + C ^ 2 * y ^ 2 - A1 ^ 2 * C ^ 2
f1 = f.change_ring(Zmod(p))
f2 = f.change_ring(Zmod(q))
xp = f1.roots()
xq = f2.roots()
x1 = CRT([Integer(xp[0][0]),Integer(xq[0][0])],[p,q])
y1 = ((A2 * x1 ^ 2 + D * x1 + F) * inverse_mod(-E,N)) % N

ellipse = Curve(A1 ^ 2,0,C ^ 2,0,0,-(A1 * C) ^ 2) 
parabola = Curve(A2,0,0,D,E,F)
assert ellipse(x=x0,y=y0) == parabola(x=x0,y=y0)
assert ellipse(x=x1,y=y1) == parabola(x=x1,y=y1)
print(hex(N))
print(hex(x1))
print(hex(C))
print(hex(F))

'''
0x5da08737d91b4845151da8e22d4d591c82dc7247015a314ae41cc8283496102c5121f8c6cd1e6cba7cd1b982be45f9692085330c7f35fd632d638f8de2cd544f278ee4f4a9043db668a15d088284f60d63f9320bc23164f07cb4ada050d26993cf31161ea42bc4ecddf8244d26eff338669ca43bae6b26a6296c4dd6a3771f7ee3aade8a2752d1daecf0d476f1a9c92cf933effb2e811a67d5cae1a370fd7d96088c895ad6496fe0fc9709209301a58b131d9ef97804fb01578309c6c0bcdfbe71430cffaa9f53d272b194e6d3d981f8a4a6ba7b98d0f63745b30b89d3cd549babd7b9a15a1a1b6344b7057a0b499319311182879bec0d6fb8e694a98c990eb9
0x17ad784481184d91239601adbb358489c241fa70b9938fd8adcca5eaaaab44f3c707d6a0595acaf43f35c03e226d965d62e7b53403b5610df9c0d3863768714a3264f1e0b09f8a5dbc37c5fa9dc34ad86875917a0d0805d9520cf0d34fd3851880aed1d0a93240555643b14652f592416de5acfee4c49c93f3f777c6654b82d3a10d50a612db1416600c34408e64d3a53424132fa87aed6f47dcce07dd467f00b1d3f8138fbe2cf404a6764aea2e64dd6c48ab4f8c66b0495cfde2cdfc9d8ed98bfa41ead86bfa10a6d7db2dbbae1d24f10be02ac42a631679097ac665a1436071748b56527e74cabdeded41f85bff18ceeafa2fcb692fa5959af952663b1137
0x57754258622da2566497ed635f8c25a898c9fc95e8571e113074d6fe874cf75c8e722beb7eba0dc86913cf647447591ec8888b617548f088992d5eb4cb84e90ca7b4eb950fb0d7b8d4c5c64904db968721ae9af263c7ddd47955da7056444f558ec5db233cb1381c9fe1f0dc935d686e689d0f6ec9c98f74b988332a092267c1152801b5ca618e3efc066fce916f6d522c8619b2b9cdc341ecd7124d247890c9af90d1d4c526a6c77a634f9aa39ca941b876ff539a91df5c029a7b08e5f13be1dd72c600bf51e34b91736012f5e9aa68e0e21f770c57c576976186a5dfbe4c374c0b08950720396bfb16c64ae4213ea519b8f27f8747f763abeff001f5010a41
0x5da08737d91b4845151da8e22d4d591c82dc7247015a314ae41cc8283496102c5121f8c6cd1e6cba7cd1b982be45f9692085330c7f35fd632d638f8de2cd544f278ee4f4a9043db668a15d088284f60d63f9320bc23164f07cb4ada050d26993cf31161ea42bc4ecddf814c1073fd8e50b7f5491bfa9fae2df3233e9f4220f04e6a47876d6e347f18f018310e973e06b782c67949d73d0c4d5a77e2685d6aaa92d5afdc28961e41dcd9242dcaa51a8b9ac2e42ba19320f933ae2aba5aa2642664f0a13d19a939c320417108ffbcc6fc5a50bba55f157cabfdf51ca37a73c2b3e3c65b2e3ad0666e2cacbdfe1d2e8f91e23bf128f714f390bdb992058b06107de
'''