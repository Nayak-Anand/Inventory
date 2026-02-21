# Dusri GitHub Profile Par Push Karne Ke Steps

## 1. GitHub par naya repo banao (dusri profile se login karke)

- Dusri profile se https://github.com par login karo
- **New repository** banao
- Repo name daalo (jaise `Inventory` ya `B2B-Inventory`)
- **Create repository** click karo (README / .gitignore add mat karo)
- Jo URL milega (jaise `https://github.com/DUSRA-USERNAME/repo-name.git`) use copy karo

---

## 2. Project folder mein Git init karo

Terminal / PowerShell kholo aur yeh commands chalao:

```powershell
cd d:\Inventory

# Git init (pehli baar)
git init

# Saari files add karo
git add .

# Pehla commit
git commit -m "Initial commit: B2B Inventory app"
```

---

## 3. Dusri profile ka remote add karo

**HTTPS use karoge** (dusri profile ka username/password ya Personal Access Token):

```powershell
git remote add origin https://github.com/DUSRA-USERNAME/REPO-NAME.git
```

**REPO-NAME** aur **DUSRA-USERNAME** apni dusri profile ke hisaab se badalna.

---

## 4. Push karo

```powershell
git branch -M main
git push -u origin main
```

Jab password maange to **Personal Access Token (PAT)** daalo, normal password kaam nahi karta.

- GitHub → Settings → Developer settings → Personal access tokens
- Dusri profile se naya token banao (repo access allow karo)
- Wahi token password ki jagah use karo

---

## Agar pehle se kisi aur profile ka remote hai

Pehle current remote dekho:

```powershell
git remote -v
```

Agar `origin` pehle se kisi aur account ka hai to:

```powershell
git remote remove origin
git remote add origin https://github.com/DUSRA-USERNAME/REPO-NAME.git
git push -u origin main
```

---

## Short checklist

1. Dusri profile se GitHub par naya repo banao  
2. `d:\Inventory` mein: `git init` → `git add .` → `git commit -m "Initial commit"`  
3. `git remote add origin https://github.com/DUSRA-USERNAME/REPO-NAME.git`  
4. `git branch -M main` → `git push -u origin main`  
5. Password ki jagah dusri profile ka **Personal Access Token** use karo  
