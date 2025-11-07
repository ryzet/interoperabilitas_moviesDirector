# MODUL 5: Pengamanan API - Autentikasi dan Autorisasi dengan JWT

## Berikut kodingan yang saya punya
1. middleware 
![Screenshot](images/gambar1.png)
middleware  ini dugunakan untuk fungsi perantara antara request (permintaan) dari klien dan response (jawaban) dari server
2. database.js 
![Screenshot](images/gambar2.png)
![Screenshot](images/gambar3.png)
![Screenshot](images/gambar4.png)
kode ini digunakan untuk menyimpan data di database
3. server.js
![Screenshot](images/gambar5.png)
![Screenshot](images/gambar6.png)
![Screenshot](images/gambar7.png)
![Screenshot](images/gambar8.png)
![Screenshot](images/gambar9.png)
![Screenshot](images/gambar10.png)
![Screenshot](images/gambar11.png)
![Screenshot](images/gambar12.png)
kode ini digunakan untuk titik awal (entry point) dari aplikasi Node.js saya khususnya ketika menggunakan framework Express.js.

disini saya menambahkan auth untuk Membatasi siapa yang boleh mengakses endpoint tertentu dan Melindungi data dan fitur CRUD agar hanya user yang sudah login bisa menggunakannya.

Selain itu saya juga menambahkan JWT (json web token) supaya kita dapat menerima token saat login 