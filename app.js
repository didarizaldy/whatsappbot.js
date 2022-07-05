const { Client, MessageMedia, Location} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require("fluent-ffmpeg");

const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
    restartOnAuthFail: true,
    // executablePath: "C:\Program Files\Google\Chrome\Application\chrome.exe",
    puppeteer: {
        headless: true,
        args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
        ],
    },
    session: sessionCfg,
});

client.initialize();

client.on('qr', (qr) => {
    qrcode.generate(qr);
    });

client.on('ready', () => {
    console.log('Connect !!');
});

client.on('authenticated', (session) => {
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', function(session) {
    console.log('Auth failure, restart...')
})

client.on('disconnected', (reason) => {
    console.log('message', 'Whatsapp is disconnect!');
    fs.unlinkSync(SESSION_FILE_PATH, function(err) {
        if(err) return console.log(err)
        console.log('Deleting file session...') 
    });
    client.destroy();
    client.initialize();
});

client.on('message', async pesan => {
    const args = pesan.body.slice(pesan.length).split(' ')
    console.log(args)
    const message = args.shift().toLowerCase()
    const contact = await pesan.getContact();
    const chat = await pesan.getChat();

    if (message === "hello" || message === "helo" || message === "hallo" || message === "halo"  || message === "hai" || message === "hi" || message === "hay") {
        chat.sendStateTyping();
        client.sendMessage(pesan.from, `Hai ${contact.pushname}, 👋\nAda yg mau anda sampaikan ke saya ?\n\nSilahkan tinggalkan pesan i'll reply asap😊`),
        client.sendMessage(pesan.from, "Anyway, disini juga ada beberapa menu yg bisa anda coba.\nSilahkan ketik : */services*")
    }
    if(message === "katalogg") {
		if(!args[0]) {
            chat.sendStateTyping();
            client.sendMessage(pesan.from, "Silahkan Masukkan kode katalog !"); 
        }
		if(args[0] === "1") pesan.reply("Argument kedua tidak diperbolehkan");
		if(args[0] === "2") pesan.reply("Argument ketiga tidak diperbolehkan");
    }
})

client.on('message', async msg => {
    const chat = await msg.getChat();
    const contact = await msg.getContact()
    const ownerNumber = ["6287785550985"]
    const isOwner = ownerNumber.includes(contact.number)

    if (msg.body.startsWith('/kirimmm ')) {
        if (isOwner) {
            let number = msg.body.split(' ')[1];
            let formatted = number.replace(/\D/g, '');
            if (formatted.startsWith('0')) {
                number = '62' + number.substr(1);
            }
            let messageIndex = msg.body.indexOf(formatted) + number.length;
            let message = msg.body.slice(messageIndex, msg.body.length);
            number = number.includes('@c.us') ? number : `${number}@c.us`;
            let chat = await msg.getChat();
            const checkRegisteredNumber = async function(number) {
                const isRegistered = await client.isRegisteredUser(number);
                return isRegistered
            }
            const isRegisteredNumber = await checkRegisteredNumber(number);
            if (!isRegisteredNumber === true) {
                msg.reply('Nomor Tersebut tidak terdaftar dalam Whatsapp')
            } else {
                chat.sendSeen();
                client.sendMessage(number, message);
                msg.reply(`Pesan Terkirim ke No. ${formatted}\n\n\nDengan Isi Pesan : \n${message}`)
            }
        } else{
            client.sendMessage(msg.from, 'Hanya tersedia untuk Premium')
        }
    } else if (msg.body.startsWith('/kirimke ')) {
        if (msg.hasMedia) {
            const dokumentmedia = await msg.downloadMedia();
            let number = msg.body.split(' ')[1];
            let formatted = number.replace(/\D/g, '');
            if (formatted.startsWith('0')) {
                number = '62' + number.substr(1);
            }
            let messageIndex = msg.body.indexOf(formatted) + number.length;
            let message = msg.body.slice(messageIndex, msg.body.length);
            number = number.includes('@c.us') ? number : `${number}@c.us`;
            let chat = await msg.getChat();
            const checkRegisteredNumber = async function(number) {
                const isRegistered = await client.isRegisteredUser(number);
                return isRegistered
            }
            const isRegisteredNumber = await checkRegisteredNumber(number);
            if (!isRegisteredNumber === true) {
                msg.reply('Nomor Tersebut tidak terdaftar dalam Whatsapp')
            } else {
                chat.sendSeen();
                client.sendMessage(number, dokumentmedia, { caption: `${message}` });
                msg.reply(`Pesan Terkirim ke No. ${formatted}\n\n\nDengan Isi Pesan : \n${message}`)
            }
        } else {
            if (msg.body.startsWith('/kirimke ')) {
                let number = msg.body.split(' ')[1];
                let formatted = number.replace(/\D/g, '');
                if (formatted.startsWith('0')) {
                    number = '62' + number.substr(1);
                }
                let messageIndex = msg.body.indexOf(formatted) + number.length;
                let message = msg.body.slice(messageIndex, msg.body.length);
                number = number.includes('@c.us') ? number : `${number}@c.us`;
                let chat = await msg.getChat();
                const checkRegisteredNumber = async function(number) {
                    const isRegistered = await client.isRegisteredUser(number);
                    return isRegistered
                }
                const isRegisteredNumber = await checkRegisteredNumber(number);
                if (!isRegisteredNumber === true) {
                    msg.reply('Nomor Tersebut tidak terdaftar dalam Whatsapp')
                } else {
                    chat.sendSeen();
                    client.sendMessage(number, message);
                    msg.reply(`Pesan Terkirim ke No. ${formatted}\n\n\nDengan Isi Pesan : \n${message}`)
                }
            }
        }
    } else if (msg.body.startsWith('/sendto ')) {
        let number = msg.body.split(' ')[1];
        let formatted = number.replace(/\D/g, '');
        if (formatted.startsWith('0')) {
            number = '62' + number.substr(1);
        }
        let messageIndex = msg.body.indexOf(formatted) + number.length;
        let message = msg.body.slice(messageIndex, msg.body.length);
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        let chat = await msg.getChat();
        const checkRegisteredNumber = async function(number) {
            const isRegistered = await client.isRegisteredUser(number);
            return isRegistered
        }
        const isRegisteredNumber = await checkRegisteredNumber(number);
        if (!isRegisteredNumber === true) {
            chat.sendSeen();
            msg.reply('Silahkan masukkan token : ')
        } else {
            chat.sendSeen();
            msg.reply('Silahkan masukkan token : ')
        }
    } else if (msg.body.startsWith('/kuliah')) {
        const contact = await msg.getContact();
        client.sendMessage(msg.from, `Halo ${contact.pushname} ini layanan bot dimana kamu bisa menggunakannya untuk keperluan berinteraksi dalam perkuliahan berlaku untuk pengajar (dosen) dan juga sebagai mahasiswa dengan bahasa yang formal serta sopan.\nKamu bisa coba beberapa perintah dibawah ini !`);
        client.sendMessage(msg.from, "/tips");
        client.sendMessage(msg.from, "/custom");
        client.sendMessage(msg.from, "/absen");
        client.sendMessage(msg.from, "/tugas");
        client.sendMessage(msg.from, "/reminder");
        client.sendMessage(msg.from, "/izin");
        client.sendMessage(msg.from, "/bimbingan");
        client.sendMessage(msg.from, "/dosenmatkul");
        client.sendMessage(msg.from, "/dosendaring");
        client.sendMessage(msg.from, "/dosenabsen");
    } else if (msg.body.startsWith('/tips')) {
        chat.sendStateTyping();
        client.sendMessage(msg.from, 'Harap perhatikan etika pada saat berinteraksi dengan dosen diantaranya :\n\n🕒 Perhatikan Waktu !\nPagi = 06:00 - 11:00\nSiang = 13:00 - 15:00\nMalam = 18:00 - 19:00\nHINDARI WAKTU ISTIRAHAT DAN WAKTU IBADAH\n\n✨ Mulailah obrolan dengan kata-kata yang ramah dan sopan dapat dimulai dengan ucapan salam\n\n✨ Akhiri obrolan dengan ucapan terima kasih atau salam\n\n✨ Hindari spam chat yang berlebihan terutama sampai menelpon !!');
    } else if (msg.body.startsWith('/custom')) {
        let partof = msg.body.slice(7).split(" .");
        if (partof.length <= 6) {
            chat.sendStateTyping();
            return msg.reply('Format Salah !!\n\n/costum .waktu .Ibu/Bapak .NamaKamu .Jurusan .TahunAngkatan .Pesan'), 
            client.sendMessage(msg.from, "/custom .pagi .Ibu .Rizal .Teknik Informatika .2019 .bermaksud untuk bimbingan kepada ibu jika ibu bersedia");
        }
        chat.sendStateTyping();
        msg.reply(`Selamat ${partof[1]} ${partof[2]}, mohon maaf menganggu waktunya.\n\nSaya ${partof[3]}, mahasiswa ${partof[4]} angkatan ${partof[5]} ${partof[6]} terima kasih sebelumnya.`);
    } else if (msg.body.startsWith('/absen')) {
        let partof = msg.body.slice(6).split(" .");
        if (partof.length <= 8) {
            chat.sendStateTyping();
            return msg.reply('Format Salah !!\n\n/absen .NamaKampus .Matkul .Hari .Tanggal .Bulan .Tahun .NamaKamu .NPM'), 
            client.sendMessage(msg.from, '/absen .Universitas Gunadarma .Pengantar Sistem Komputer .Rabu .31 .Maret .2021 .Rizal .21115881');
        }
        chat.sendStateTyping();
        msg.reply(`Daftar Hadir Mahasiswa dikuliah Online\n${partof[1]}\n*Mata Kuliah : ${partof[2]}*\nHari ${partof[3]}, ${partof[4]} ${partof[5]} ${partof[6]}\n\nAbsensi :\n1.${partof[7]} ${partof[8]}`);
    } else if (msg.body.startsWith('/tugas')) {
        let partof = msg.body.slice(6).split(" .");
        if (partof.length <= 8) {
            chat.sendStateTyping();
            return msg.reply('Format Salah !!\n\n/tugas .TugasKeberapa .Matkul .Hari .Tanggal .Bulan .Tahun .NamaKamu .NPM'), 
            client.sendMessage(msg.from, '/tugas .Tugas 4 .Pengantar Sistem Komputer .Rabu .31 .Maret .2021 .Rizal .21115881');
        }
        chat.sendStateTyping();
        msg.reply(`Daftar Mahasiswa yang sudah mengumpulkan Tugas ${partof[1]}\n*Mata Kuliah : ${partof[2]}*\nHari ${partof[3]}, ${partof[4]} ${partof[5]} ${partof[6]}\n\nAbsensi :\n1.${partof[7]} ${partof[8]}`);
    } else if (msg.body.startsWith('/reminder')) {
        let partof = msg.body.slice(9).split(" .");
        if (partof.length <= 7) {
            chat.sendStateTyping();
            return msg.reply('Format Salah !!\n\n/reminder .Waktu(pagi/siang/sore/malam) .Bapak/Ibu .Nama .Kelas .Semester .Matkul .Jam'), 
            client.sendMessage(msg.from, '/reminder .pagi .Bapak .Rizal .3KB07 .6 .Pengantar Sistem Komputer .09:30');
        }
        chat.sendStateTyping();
        msg.reply(`Selamat ${partof[1]} ${partof[2]}, maaf menganggu waktu ${partof[1]}nya.\n\nSaya ${partof[3]} ketua tingkat dari kelas ${partof[4]} semester ${partof[5]} mohon izin untuk mengingatkan, bahwa ${partof[2]} ada jadwal mengajar di kelas kami dengan mata kuliah ${partof[6]} di jam ${partof[7]}\n\nAtas perhatiannya kami ucapkan terima kasih`);
    } else if (msg.body.startsWith('/izin')) {
        let partof = msg.body.slice(5).split(" .");
        if (partof.length <= 7) {
            chat.sendStateTyping();
            return msg.reply('Format Salah !!\n\n/izin .Waktu(pagi/siang/sore/malam) .Bapak/Ibu .NamaKamu .Jurusan .Angkatan .Kelas .AlasanIzin'), 
            client.sendMessage(msg.from, '/izin .Bapak .Rizal .Teknik Informatika .2019 .3KB07 .umrah');
        }
        chat.sendStateTyping();
        msg.reply(`Selamat ${partof[1]} ${partof[2]}, maaf menganggu waktu ${partof[1]}nya.\n\nSaya ${partof[3]} mahasiswa ${partof[4]} angkatan ${partof[5]} dari kelas ${partof[6]} pada hari ini mohon izin untuk belum dapat hadir untuk mengikuti perkuliahan yang ${partof[2]} bawakan dikarenakan ${partof[7]} \n\nAtas perhatian ${partof[1]} saya ucapkan terima kasih`);
    } else if (msg.body.startsWith('/bimbingan')) {
        const media = MessageMedia.fromFilePath('./gambar/stick/fightingbro.webp');
        let partof = msg.body.slice(10).split(" .");
        if (partof.length <= 6) {
            chat.sendStateTyping();
            return msg.reply('Format Salah !!\n\n/bimbingan .Waktu(pagi/siang/sore/malam) .Bapak/Ibu .NamaKamu .Jurusan .TahunAngkatan .Kelas'), 
            client.sendMessage(msg.from, '/bimbingan .Pagi .Ibu .Rizal .Teknik Informatika .2019 .4KB07');
        }
        chat.sendStateTyping();
        msg.reply(`Selamat ${partof[1]} ${partof[2]}, mohon maaf menganggu waktu ${partof[1]}nya.\n\nSaya ${partof[3]}, mahasiswa ${partof[4]} angkatan ${partof[5]} kelas ${partof[6]} yang pada saat ini sedang menulis skripsi dan ${partof[2]} sebagai pembimbing saya. Mohon izin bertanya, adakah waktu kiranya saya bisa konsultasi ke ruangan/kediaman ${partof[2]}\nTerima kasih sebelumnya`);
        client.sendMessage(msg.from, 'Semangat ya buat bimbingannya 🎉🎉')
        client.sendMessage(msg.from, media, { sendMediaAsSticker : true })
    } else if (msg.body.startsWith('/dosenmatkul')) {
        let partof = msg.body.slice(12).split(" .");
        if (partof.length <= 10) {
            chat.sendStateTyping();
            return msg.reply('Format Salah !!\n\n/dosenmatkul .Waktu .Matkul .Pertemuan .Hari .Tanggal .Bulan .Tahun .Materi .Tugas .Deadline'), 
            client.sendMessage(msg.from, '/dosenmatkul .pagi .Pengantar Sistem Komputer .1 .Rabu .31 .Maret .2021 .PENGANTAR PERANGKAT LUNAK PENGENALAN JARINGAN KOMPUTER .- .-');
        }
        chat.sendStateTyping();
        msg.reply(`Selamat ${partof[1]},\n\nUntuk mahasiswa dengan matakuliah ${partof[2]}, pada pertemuan ke-${partof[3]}\n${partof[4]}, ${partof[5]} ${partof[6]} ${partof[7]}\n\nMateri hari ini tentang *${partof[8]}*, materi sudah diupload dan silahkan dipelajari.\nJangan lupa untuk absensi kehadiran kalian !\n\nTugas pada matakuliah ini :\n${partof[9]}\n\nBatas waktu pengumpulannya yaitu pada : \n${partof[10]}\n\nSekian dan selamat ${partof[1]},\nTerima kasih atas perhatiannya`);
    } else if (msg.body.startsWith('/dosendaring')) {
        let partof = msg.body.slice(12).split(" .");
        if (partof.length <= 4) {
            chat.sendStateTyping();
            return msg.reply('Format Salah !!\n\n/dosendaring .Waktu .Matkul .MediaDaring (ZOOM/Google Meet) .URL'), 
            client.sendMessage(msg.from, '/dosendaring .Sore .Pengantar Sistem Komputer .Google Meet .https://meet.google.com/ywr-chzx-gsb');
        }
        chat.sendStateTyping();
        msg.reply(`Selamat ${partof[1]}, pada matakuliah ${partof[2]} hari ini kita akan mengadakan daring dengan menggunakan ${partof[3]}\nSilahkan bergabung : ${partof[4]}\n\nDiharapkan mahasiswa dapat bergabung daring dengan tepat waktu.\n\nTerima Kasih`);
    } else if (msg.body.startsWith('/dosenabsen')) {
        let partof = msg.body.slice(11).split(" .");
        if (partof.length <= 5) {
            chat.sendStateTyping();
            return msg.reply('Format Salah !!\n\n/dosenabsen .Waktu .Bapak/Ibu .Matkul .Materi .Deadline'), 
            client.sendMessage(msg.from, '/dosenabsen .Pagi .Ibu .Pengantar Sistem Komputer .HARDWARE DAN SOFTWARE PADA KOMPUTER .7 April 2021');
        }
        chat.sendStateTyping();
        msg.reply(`Selamat ${partof[1]}, mohon maaf untuk hari ini ${partof[2]} tidak bisa mengajar pada matakuliah kali ini.\n\nMateri matakuliah ${partof[3]} tentang ${partof[4]} sudah diupload kemudian silahkan pelajari, apabila ada yg belum jelas bisa segera ditanyakan ke ${partof[2]} dan tugasnya segera dikerjakan\n\nBatas waktu pengumpulan tugas yaitu : ${partof[5]}.\n\nTerima kasih`);
    }
});

client.on('message', async message => {
    const chat = await message.getChat();
    const contact = await message.getContact()
    const ownerNumber = ["6287785550985"]
    const isOwner = ownerNumber.includes(contact.number)

	if (message.body.startsWith('/status')) {
        client.sendMessage(message.from, 'Status Aktif !');
	} else if (message.body == '/stiker' && message.hasMedia || message.body == '/sticker' && message.hasMedia) {
        const attachmentData = await message.downloadMedia();
        client.sendMessage(message.from, attachmentData, {sendMediaAsSticker: true});
    } else if (message.hasMedia) {
        if (!['document'].includes(message.type)) { return } {
            const attachment = await message.downloadMedia()
            if (message.type === 'document' && !attachment.mimetype.endsWith('webp') && !attachment.mimetype.endsWith('png')) { return }
            client.sendMessage(message.from, attachment, { sendMediaAsSticker: true });
        }
    } else if (message.body.startsWith('/cekresi')) {
        const cekResi = require ('./helper/cekResi')
        const args = message.body.trim().split(/ +/).slice(1)
        if (args.length !== 2) 
        return client.sendMessage(message.from, `🛑Format Salah !\n\n📄Format pesan : /cekresi JenisEkspedisi No.Resi`),
        client.sendMessage(message.from, 'Contoh :\n\n/cekresi jnt 000210000280'),
        client.sendMessage(message.from, '🚚 Kurir yang tersedia:\n• Pos\n• Wahana\n• Jnt\n• Sicepat')
        const expedisi = ['pos', 'wahana', 'jnt', 'sicepat']
        if (!expedisi.includes(args[0])) return client.sendMessage(message.from, `Jenis ekspedisi tidak didukung layanan ini.\n\n🚚 Kurir yang tersedia:\n• Pos\n• Wahana\n• Jnt\n• Sicepat`)
        console.log('Memeriksa No Resi', args[1], 'dengan ekspedisi', args[0])
        cekResi(args[0], args[1]).then((result) => client.sendMessage(message.from, result))
    } else if (message.body.startsWith('/cekongkir')) {
        const cekOngkir = require ('./helper/cekOngkir')
        const args = message.body.trim().split(/ +/).slice(1)
        if (args.length !== 4)
        return client.sendMessage(message.from, `🛑Format Salah !\n\n📄Format pesan : /cekresi JenisEkspedisi No.Resi`),
        client.sendMessage(message.from, 'Contoh :\n\n/cekresi jnt 000210000280'),
        client.sendMessage(message.from, '🚚 Kurir yang tersedia:\n• Pos\n• Wahana\n• Jnt\n• Sicepat')
        const expedisi = ['jne', 'tiki', 'pos']
        if (!expedisi.includes(args[3])) return client.sendMessage(message.from, `Jenis ekspedisi tidak didukung layanan ini.\n\n🚚 Kurir yang tersedia:\n• Pos\n• Tiki\n• JNE`)
        console.log('Kota Asal', args[0], 'Kota Tujuan', args[1], 'Berat', args[2], 'Ekspedisi', args[3])
        cekOngkir(args[0], args[1], args[2], args[3]).then((result) => client.sendMessage(message.from, result))
    } else if (message.body.startsWith('/cekstatus')) {
        const chat = await message.getChat();
        const chatz = await client.getChats();

        if (isOwner) {
            client.sendMessage(message.from, `💬 *Pesan didalam BOT*\n${chat.unreadCount} Chat yang belum terbaca\nDan ${chatz.length} Obrolan.`)
        } else {
            client.sendMessage(message.from, 'Hanya tersedia untuk Premium')
        }
    } else if (message.body === '/delete') {
        if (isOwner) {
            if (message.hasQuotedMsg) {
                const quotedMsg = await message.getQuotedMessage();
                if (quotedMsg.fromMe) {
                    quotedMsg.delete(true);
                    client.sendMessage(message.from, 'Pesan sudah dihapus')
                }
            }
        } else {
            client.sendMessage(message.from, 'Hanya tersedia untuk Premium')
        }
    } else if (message.body === '/services') {
        chat.sendStateTyping();
        client.sendMessage(message.from, 'Halo ini adalah layanan balas otomatis, tetapi kamu juga bisa tetap meninggalkan pesan disini kok ! \n\nKamu bisa mencoba beberapa perintah dibawah ini untuk mengetahui fitur apa aja yg tersedia');
        client.sendMessage(message.from, '/personal')
        client.sendMessage(message.from, '/cafe')
        client.sendMessage(message.from, '/olshop')
        client.sendMessage(message.from, '/kuliah')
        client.sendMessage(message.from, '/lamarkerja')
        client.sendMessage(message.from, '/stiker')
        client.sendMessage(message.from, '/cekresi')
    } else if (message.body === '/personal') {
        chat.sendStateTyping();
        client.sendMessage(message.from, 'Hai, ini adalah menu personal dimana kamu bisa mencari tahu lebih tentang saya selaku pengembang bot ini.\n\nKamu bisa cobain perintah dibawah ini🚀');
        client.sendMessage(message.from, '/resume')
        client.sendMessage(message.from, '/about')
        client.sendMessage(message.from, '/web')
        client.sendMessage(message.from, '/domisili')
    } else if (message.body === '/resume') {
        const media = MessageMedia.fromFilePath('./gambar/resume.pdf');
        client.sendMessage(message.from, media)
    } else if (message.body === '/about') {
        const contact = await message.getContact();
        const media = MessageMedia.fromFilePath('./gambar/stick/madewithlove.png')

        chat.sendStateTyping();
        await client.sendMessage(message.from, `Perkenalkan saya Rizal pengembang bot auto responder ini dan hai ${contact.pushname} salam kenal.\n👋👋\n\nBot ini dibuat karena keterbatasan fitur yang diberikan oleh Whatsapp Businness dan dikembangkan dengan memberikan fitur-fitur yang tidak didapatkan melalui Whatsapp Businness.\n\nBot ini sangat cocok untuk kalian yang ingin mempunyai fitur balas otomatis dan menampilkan katalog.\n\nBeberapa fitur lainnya juga telah ditambahkan tanpa mengurangi kenyamanan pengguna. 😊`)
        client.sendMessage(message.from, 'Made with ❤️ sincerely, Rizal')
        client.sendMessage(message.from , media, { sendMediaAsSticker : true } )
    } else if (message.body === '/web') {
        client.sendMessage(message.from, 'Masih dalam tahap pengembangan nih, mohon ditunggu yaa...\nService Will Available Soon 😊')
    } else if (message.body === '/domisili') {
        client.sendMessage(message.from, new Location(-6.232991, 106.974181, 'Rizal\nKranji, Bekasi Barat'));
    } else if (message.location) {
       client.sendMessage(message.from, message.location);
    } else if (message.body === '/olshop') {
        chat.sendStateTyping();
        client.sendMessage(message.from, 'Masih dalam tahap pengembangan nih, mohon ditunggu yaa...\nService Will Available Soon 😊');
    } else if (message.body === '/lamarkerja') {
        chat.sendStateTyping();
        client.sendMessage(message.from, 'Masih dalam tahap pengembangan nih, mohon ditunggu yaa...\nService Will Available Soon 😊');
    } else if (message.body === '/cafe') {
        chat.sendStateTyping();
        client.sendMessage(message.from, 'Ini adalah layanan konsumen auto balas pesan, tetapi kamu juga bisa reservasi dari sini kok.\n\nBeberapa perintah berikut bisa kamu coba untuk mengetahui informasi apa saja yang terdapat dalam layanan kami :\n\n*/info*\n*/lokasi*\n*/hotoffer*\n*/katalog*\n*/gojek*\n*/apps*\n*/website*\n\nDan untuk reservasi silahkan tinggal pesan berupa Nama : .....\nWaktu Reservasi : .....\nDan DP sebesar IDR. 50k\n\nTerima Kasih dan Kami tunggu kamu yaaa 😁😁');
    } else if (message.body === '/info') {
        chat.sendStateTyping();
        const media = MessageMedia.fromFilePath('./gambar/3.jpg');
        client.sendMessage(message.from, media, { caption: '*Dida Food And Beverage*\nJl. Bintara No.17, RT.013/RW.010, Bintara, Kec. Bekasi Bar., Kota Bks, Jawa Barat 17134\n\n✓ COD\n✓ Makan Ditempat (Mengikuti Protokol Kesehatan)\n✓ Antar Tanpa Bertemu\n\n\nJadwal Buka :\n•Senin : 09:00 - 00:00(COD 24 Jam)\n•Selasa : 09:00 - 00:00(COD 24 Jam)\n•Rabu : 09:00 - 00:00(COD 24 Jam)\n•Kamis : 09:00 - 00:00(COD 24 Jam)\n•Jumat : 09:00 - 00:00(COD 24 Jam)\n•Sabtu : 09:00 - 00:00(COD 24 Jam)\n•Minggu : 09:00 - 00:00(COD 24 Jam)\n\nTelp. (021) 844556677\n\n\nSilahkan Reservasi 4 jam sebelum datang 😄' } );
    } else if (message.body === '/lokasi') {
        client.sendMessage(message.from, new Location(-6.232656, 106.965425, 'Dida Food & Beverage\nBintara, Bekasi Barat'));
    } else if (message.location) {
       client.sendMessage(message.from, message.location);
    } else if (message.body == '/apps'){
        const media = MessageMedia.fromFilePath('./gambar/2.jpg');
        chat.sendStateTyping();
        client.sendMessage(message.from, media, { caption: 'Dapatkan Aplikasi Kami di Playstore sekarang :\nhttps://play.google.com/store/apps/details?id=com.mcdonalds.mobileapp' } );
    } else if (message.body == '/gojek'){
        const media = MessageMedia.fromFilePath('./gambar/4.jpg');
        chat.sendStateTyping();
        client.sendMessage(message.from, media, { caption: 'Look at this! D - Food & Beverage,\nBintara, Bekasi Barat on GoFood.\nhttps://gofood.link/u/RZmYd' } );
    } else if (message.body == '/website'){
        chat.sendStateTyping();
        client.sendMessage(message.from, 'Kamu juga bisa loh lihat katalog produk kami lainnya langsung di website remsmi kami,\nKlik link dibawah ini ya fellas !!\n\nhttp://didarizaldy.my.id/');
    } else if (message.body == '/hotoffer'){
        const media = MessageMedia.fromFilePath('./gambar/1.jpg');
        chat.sendStateTyping();
        client.sendMessage(message.from, media, { caption: '*Buy 1 Get 1*\nSpecial Offer only 100k This Month!!\n\n💁‍♀️ Segera Pesan Sekarang !!' })
    } else if (message.body == '/katalog'){
        const katalog = MessageMedia.fromFilePath('./gambar/Catalog.pdf');
        client.sendMessage(message.from, katalog);
    } else if (message.body.startsWith('')) {
        let chat = await message.getChat();
        if (chat.isGroup) {
            chat.leave();
        } else {
            chat.markUnread();
        }
    }
});