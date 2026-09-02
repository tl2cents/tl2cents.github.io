---
layout: academic
title: Academic
permalink: /academic/
key: page-academic
article_header: false
show_title: false
academic:
  profile:
    eyebrow: Academic Homepage
    name: Lili Tang
    name_zh: 唐雳雳
    photo: /assets/images/profile-github.jpg
    role: Ph.D. in Cybersecurity
    location: Beijing, China
    email: tanglili@iie.ac.cn
    links:
      - label: ORCID
        detail: 0009-0008-7492-478X
        url: https://orcid.org/0009-0008-7492-478X
        icon: fab fa-orcid
      - label: Institution
        detail: UCAS, China
        url: https://english.ucas.ac.cn/
        icon: fas fa-university
      - label: GitHub
        detail: "@tl2cents"
        url: https://github.com/tl2cents
        icon: fab fa-github
      - label: Blog
        detail: Notes and essays
        url: /
        icon: fas fa-pen-nib
      - label: Resume
        detail: Email me for a detailed CV
        url: "#"
        icon: far fa-file-alt
      # - label: About
      #   detail: Personal profile
      #   url: /about.html
      #   icon: far fa-id-card
  intro:
    title: About Me
    body: |
      I am a Ph.D. student in Cybersecurity at the University of Chinese Academy of Sciences (**UCAS**), advised by Prof. Xiaorui Gong. I received my B.Sc. degree in information security from the University of Science and Technology of China (**USTC**) in 2022. In parallel, I was a core member of the NeSE CTF team from 2022 to 2026, focusing on crypto and blockchain in international CTF competitions.

      My doctoral research primarily focuses on the Generalized Birthday Problem and Wagner's algorithm. More broadly, I maintain strong research interests in post-quantum cryptography (especially code-based), incremental cryptography, and blockchain security.

  interests:
    - title: Applied Cryptography
      description: Cryptanalysis of real-world protocols and cryptographic schemes, with a focus on post-quantum candidates, zk-SNARKs and blockchain applications.
    - title: AI for Cryptography/Security
      description: Automatic vulnerability discovery, especially for cryptographic protocols and implementations. Vibe research in the realms of cryptography and security.
  news:
    - date: July, 2026
      pinned: true
      text: I expect to complete my Ph.D. after **June, 2027**. Currently, I'm looking for postdoctoral or other research positions (**Crypto/LLM/Security/AI4S**). If you find my research areas matching any opportunity, please feel free to contact me via email.
    - date: July, 2026
      text: Our joint work on using LLM agents to discover vulnerabilities in cryptographic libraries will be presented at the **Black Hat USA 2026 Briefings**. See the [talk page](https://blackhat.com/us-26/briefings/schedule/index.html#breaking-the-unbreakable-dismantling-the-myth-of-trusted-cryptographic-libraries-on-demand-only-53162) for details.
  #   - date: 2025
  #     text: Add a selected research milestone or teaching activity here.
  #   - date: 2024
  #     text: Keep this list short so the page stays current and easy to scan.
  publications:
    - venue: The 46th International Cryptology Conference
      venue_short: Crypto 2026
      # status: To appear
      title: On the Regularity of the Generalized Birthday Problem
      authors: Lili Tang, Yao Sun, and Xiaorui Gong
      highlight_author: Lili Tang
      ratings:
        - CCF-A
        - CORE-A*
      summary: "TL;DR: We study structural regularity in the Generalized Birthday Problem and its impact on practical schemes including incremental hashing and Equihash. The main contribution of this work is the complexity analysis of regular and non-regular GBP, with important implications for the $k$-$\\textsf{XOR}$ and $k$-$\\textsf{SUM}$ problems."
      links:
        - label: EPRINT
          url: "https://eprint.iacr.org/2025/1351"
        - label: Code
          url: "https://github.com/tl2cents/Generalized-Birthday-Problem"
    - venue: IACR Transactions on Cryptographic Hardware and Embedded Systems, 2026 (2)
      venue_short: CHES 2026
      # status: Published
      title: Memory Optimizations of Wagner’s Algorithm with Applications to Equihash
      authors: Lili Tang, Rui Ding, Yao Sun, and Xiaorui Gong
      highlight_author: Lili Tang
      ratings:
        - CCF-B
        - CORE-A
      summary: "TL;DR: We propose a new list-item-reduction framework that reduces the memory complexity of Wagner’s algorithm from $2nN$ to $nN$ bits, thereby weakening the ASIC resistance of Equihash. This optimization has important implications for the efficient implementation of Wagner-style algorithms."
      links:
        - label: EPRINT
          url: "https://eprint.iacr.org/2025/2141"
        - label: Code
          url: "https://github.com/tl2cents/Wagner-Algorithms"
    - venue: IACR Transactions on Symmetric Cryptology, 2026 (3)
      venue_short: FSE 2027
      title: "k-Tree Revisited: Memory-Time Cost of Preimage Attack on Incremental Hashes"
      authors: Rui Ding*, Lili Tang*, Shaomin Chen, and Xiaorui Gong
      contribution_note: Equal Contribution
      highlight_author: Lili Tang
      ratings:
        - CCF-B
        - CORE-B
      summary: "TL;DR: We extend post-retrieval to Wagner’s $k$-tree algorithm, reducing peak memory from exponential in $k$ to $O(k^2\\ell N)$ with only linear time overhead. Applied to preimage attacks on incremental hashes, this trade-off can substantially reduce their memory–time cost."
      links:
        - label: EPRINT
          url: "https://eprint.iacr.org/2026/1835"
        - label: Code
          url: "https://github.com/Threonine/wagner-ktree-revisited"
  talks:
    - event: Black Hat USA 2026 Briefings
      title: "Breaking the Unbreakable: Dismantling the Myth of Trusted Cryptographic Libraries"
      authors: Guannan Wang, Lili Tang, and Guancheng Li
      speakers:
        - Guannan Wang
        - Lili Tang
      highlight_speaker: Lili Tang
      date: Aug 1-6, 2026
      location: Las Vegas
      status: On Demand
      tags:
        - Black Hat USA
      links:
        - label: Link
          url: "https://blackhat.com/us-26/briefings/schedule/index.html#breaking-the-unbreakable-dismantling-the-myth-of-trusted-cryptographic-libraries-on-demand-only-53162"
        - label: Slide
          url: "https://i.blackhat.com/BH-USA-26/Presentations/BHUS26-Wang-Breaking-the-Unbreakable-Slides.pdf"
  award_blocks:
    - label: Selected Awards
      title: Capture The Flag (CTF)
      note: "I was one of NeSE's top two contributors from 2022 to 2025. Over the same period, NeSE consistently ranked in [CTFtime](https://ctftime.org/team/13575)'s global top 10 teams (3rd in 2022, 7th in 2023, 8th in 2024, and 5th in 2025). See more awards at [nese.team](https://nese.team/awards/) and related writeups on [my blog](/archive.html). I also enjoy solving challenges on [CryptoHack](https://cryptohack.org/) and completed all of them in July 2024, [ranking 24th](https://cryptohack.org/user/IcingMoon/) globally at the time."
      items:
        - title: Crypto CTF 2025
          result: 2nd Place
          year: 2025
          url: https://ctftime.org/event/2577/
          description: "NeSE's crypto team: tl2cents (me), deebato, and Threonine."
          tags:
            - Captain
            - All Kill
        - title: N1CTF 2025
          result: 1st Place
          year: 2025
          url: https://nese.team/awards/2025/
          tags:
            - With NeSE
        - title: 0CTF 2025
          result: 2nd Place
          year: 2025
          url: https://nese.team/awards/2025/
          tags:
            - With NeSE
        - title: NSU-Crypto Olympiad 2024
          result: 2nd Place
          year: 2024
          url: https://nsucrypto.nsu.ru/archive/2024/total_results/#data
          description: "Team: Lili Tang, Chenyu Li, and Hao Jiang" 
          tags:
            - Silver Medal
            - Crypto
            - Olympiad
        - title: CyberSecurityRumble Quals 2024
          result: 3rd Place
          year: 2024
          url: https://nese.team/awards/2024/
          tags:
            - With NeSE
            - Top Contributor
        - title: DEF CON CTF Qualifier 2024
          result: 9th Place
          year: 2024
          url: https://nese.team/awards/2024/
          description: First independent team from mainland China to qualify for DEFCON Finals.
          tags:
            - With NeSE
  # sections:
  #   - label: Teaching
  #     title: Teaching
  #     items:
  #       - Course or reading group entry, term and role.
  #       - Tutorial, lab, or guest lecture entry.
  #   - label: Service
  #     title: Service & Links
  #     items:
  #       - Reviewing, organizing, mentoring, or community service.
  #       - Add Google Scholar, ORCID, DBLP, or CV links when available.
---
