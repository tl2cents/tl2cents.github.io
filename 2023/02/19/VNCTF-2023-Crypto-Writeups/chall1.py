
from sympy.ntheory.residue_ntheory import nthroot_mod
from Crypto.Util.number import *
from Crypto.Cipher import AES
from random import randrange,choice
from hashlib import *
from secret import flag

import socketserver
import os
import signal
import string

table = string.ascii_letters+string.digits

nbit = 128

def pad(m,lenth):
    return m + bytes([i for i in range(lenth-int(len(m)%lenth))])

class Task(socketserver.BaseRequestHandler):
    def _recvall(self):
        BUFF_SIZE = 2048
        data = b''
        while True:
            part = self.request.recv(BUFF_SIZE)
            data += part
            if len(part) < BUFF_SIZE:
                break
        return data.strip()

    def send(self, msg, newline=True):
        try:
            if newline:
                msg += b'\n'
            self.request.sendall(msg)
        except:
            pass

    def recv(self, prompt=b''):
        self.send(prompt, newline=False)
        return self._recvall()

    def proof_of_work(self):
        proof = (''.join([choice(table)for _ in range(20)])).encode()
        sha = sha256(proof).hexdigest().encode()
        self.send(b"[+] sha256(XXXX+" + proof[4:] + b") == " + sha )
        XXXX = self.recv(prompt = b'[+] Plz Tell Me XXXX :')
        if len(XXXX) != 4 or sha256(XXXX + proof[4:]).hexdigest().encode() != sha:
            return False
        return True

    def handle(self):
        proof = self.proof_of_work()
        if not proof:
            self.request.close()
        while 1:
            qa = randrange(0,2**31) * 2
            qb = getPrime(nbit - 32)
            if isPrime(qa * qb + 1):
                q = qa * qb + 1
                break

        for _ in range(len(b'vnctf2023') - 8):
            self.send(b"Send 2 `y' elements to me:  ")
            ans = self.recv()
            try:
                y1, y2 = [int(_) % q for _ in ans.split(b',')]
            except:
                self.send(b"Your parameters are not valid! Bye!!")
                break

            AA = (y1**2 - y2**2 - 2022**3 + 2023**3) * inverse(-1, q) % q
            BB = (y1**2 - 2022**3 - AA * 2022) % q

            def add(P,Q):
                if P[0] != Q[0] and P[1] != Q[1]:
                    t = ((Q[1]-P[1]) * inverse(Q[0]-P[0],q)) %q
                else:
                    t = ((3*P[0]*P[0]+AA)*inverse(2*P[1],q))%q
                x3 = t*t - P[0] - Q[0]
                y3 = t*(P[0] - x3) - P[1]
                return (x3%q, y3%q)

            def mul(t, A, B=0):
                if not t: return B
                return mul(t//2, add(A,A), B if not t&1 else add(B,A) if B else A)

            while 1:
                Gx = randrange(0,q - 1)
                try:
                    Gy = int(nthroot_mod((Gx**3 + AA * Gx + BB) % q,2,q))
                    assert (pow(Gy,2,q) == (Gx**3 + AA * Gx + BB) % q)
                    break
                except:
                    continue

            G = (Gx,Gy)
            m = randrange(0,q-1)
            C = mul(m,G)
            aes = AES.new(m.to_bytes(16, 'big'), AES.MODE_CBC, bytes(16))
            enc_flag = aes.encrypt(pad(flag,16))

            self.send(b'The parameters and encrypted flag are:')
            self.send(b'q = ' + str(q).encode())
            self.send(b'G = ('+ str(Gx).encode() + b',' + str(Gy).encode() + b')')
            self.send(b'm * G = ('+ str(C[0]).encode() + b',' + str(C[1]).encode() + b')')
            self.send(b'encrypt flag = ' + enc_flag.hex().encode())
        self.request.close()

class ThreadedServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

class ForkedServer(socketserver.ForkingMixIn, socketserver.TCPServer):
    pass

if __name__ == "__main__":
    HOST, PORT = '0.0.0.0', 10001
    print("HOST:POST " + HOST+":" + str(PORT))
    server = ForkedServer((HOST, PORT), Task)
    server.allow_reuse_address = True
    server.serve_forever() 
