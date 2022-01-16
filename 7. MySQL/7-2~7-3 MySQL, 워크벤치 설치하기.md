# MySQL 설치하기

## 맥에서 설치하기

- homebrew를 통해 설치

```
$ brew install mysql
$ brew services start mysql
$ mysql_secure_installation
$ mysql -h localhost -u root -p
```

- `$ brew install mysql` : 설치
- `$ brew services start mysql` : MySQL 시작
- `$ mysql_secure_installation` : root 비밀번호 설정
- `$ mysql -h localhost -u root -p` : MySQL 접속

# 워크벤치 설치하기

- 워크벤치: 데이터베이스 내부에 저장된 데이터를 시각적으로 관리할 숭 ㅣㅆ는 프로그램

## 맥에서 설치하기

```
$ brew install --cask mysql-workbench
```
