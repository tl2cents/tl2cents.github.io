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
    initials: Tang
    # show_photo: false
    role: Ph.D. Student in Cryptography
    affiliation: Institute of Information Engineering, University of Chinese Academy of Sciences
    location: Beijing, China
    email: tanglili [at] iie [dot] ac [dot] cn
    links:
      - label: ORCID
        detail: 0009-0008-7492-478X
        url: https://orcid.org/0009-0008-7492-478X
        icon: fab fa-orcid
      - label: Institution
        detail: IIE, CAS / UCAS
        url: https://english.ucas.ac.cn/index.php/academics/cas-institutes/573-beijing-branch/2718-beijingbranch0032
        icon: fas fa-university
      - label: GitHub
        detail: Code and projects
        url: https://github.com/tl2cents
        icon: fab fa-github
      - label: Blog
        detail: Notes and essays
        url: /
        icon: fas fa-pen-nib
      - label: CV
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
      I received my B.Sc. degree in Information Security from University of Science and Technology of China (2018-2022). I then joined University of Chinese Academy of Sciences as a Ph.D. student in Cybersecurity under the supervision of Xiaorui Gong.

      My doctoral research primarily focuses on the Generalized Birthday Problem and Wagner's algorithm. More broadly, I maintain strong research interests in post-quantum cryptography (especially code-based), zero-knowledge proofs, and blockchain security.

      In parallel, I was also a core crypto-member of NeSE CTF team from 2022 to 2026. However, following the rapid advancement of large language models, I have largely stepped away from CTF competitions since 2026, as I believe modern LLMs have fundamentally undermined the design space of many CTF challenges, particularly in the cryptography category.
  interests:
    - title: Applied Cryptography
      description: Cryptanalysis of real-world protocols and cryptographic schemes, with a focus on post-quantum candidates, zk-SNARKs and blockchain applications.
    - title: AI for Cryptography/Security
      description: Automatic vulnerability discovery, especially for cryptographic protocols and implementations. Vibe research in the realms of cryptography and security.
  # news:
  #   - date: 2026
  #     text: Replace this item with a recent paper acceptance, talk, internship, or project update.
  #   - date: 2025
  #     text: Add a selected research milestone or teaching activity here.
  #   - date: 2024
  #     text: Keep this list short so the page stays current and easy to scan.
  publications:
    - venue: The 46th International Cryptology Conference
      venue_short: Crypto 2026
      status: To appear
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
    - venue: IACR Transactions on Cryptographic Hardware and Embedded Systems, 2026(2)
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
  award_blocks:
    - label: Selected Awards
      title: Capture The Flag (CTF)
      items:
        - title: Crypto CTF 2025
          result: 2nd Place
          year: 2025
          url: https://ctftime.org/event/2577/
          description: "NeSE's crypto team: tl2cents(me), deebato, and Threonine."
          tags:
            - Captain
            - All Kill
        - title: N1CTF 2025
          result: 1st Place
          year: 2025
          url: https://nese.team/awards/2025/
          tags:
            - With NeSE
            - Crypto
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
