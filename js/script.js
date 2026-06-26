$(document).ready(function () {
  // Tempat menyimpan data base64 foto yang valid
  let base64Foto = "";


  // RULES VALIDASI (Format jQuery friendly)
 
  const rules = {
    nim: (v) => {
      if (!v.trim()) return 'NIM wajib diisi.';
      if (!/^\d+$/.test(v.trim())) return 'NIM harus berupa angka.';
      if (v.trim().length < 8) return 'NIM minimal berukuran 8 digit.';
      return '';
    },
    nama: (v) => {
      if (!v.trim()) return 'Nama lengkap wajib diisi.';
      if (v.trim().length < 5) return 'Nama Lengkap minimal terdiri dari 5 karakter.';
      return '';
    },
    email: (v) => {
      if (!v.trim()) return 'Email wajib diisi.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Harus sesuai format email yang benar.';
      return '';
    },
    nomorHp: (v) => {
      if (!v.trim()) return 'Nomor HP tidak boleh kosong.';
      if (!/^\d+$/.test(v.trim())) return 'Nomor HP hanya boleh diisi angka.';
      if (v.trim().length < 10) return 'Nomor HP minimal berukuran 10 digit.';
      return '';
    },
    jenisKelamin: () => {
      if (!$("input[name='jenisKelamin']:checked").val()) return 'Jenis Kelamin wajib dipilih.';
      return '';
    },
    prodi: (v) => {
      if (!v) return 'Program Studi wajib dipilih.';
      return '';
    },
    alamat: (v) => {
      if (!v.trim()) return 'Alamat tidak boleh kosong.';
      if (v.trim().length < 10) return 'Alamat minimal terdiri dari 10 karakter.';
      return '';
    }
  };

  // FUNGSI REAL-TIME VALIDATION MENGGUNAKAN JQUERY
  
  function validateField(field) {
    let value = "";
    if (field === 'jenisKelamin') {
      value = $("input[name='jenisKelamin']:checked").val();
    } else {
      value = $("#" + field).val();
    }

    const errorMsg = rules[field](value);
    const errEl = $("#" + field + "Err");

    if (errorMsg) {
      errEl.text(errorMsg).slideDown('fast'); // Efek Animasi 1: slideDown error
      return false;
    } else {
      errEl.slideUp('fast'); // Efek Animasi 2: slideUp error
      return true;
    }
  }

  // Event handler input untuk validasi instan saat diketik/pilih
  $("#nim, #nama, #email, #nomorHp, #alamat").on("input", function () {
    validateField($(this).attr("id"));
  });
  $("#prodi, input[name='jenisKelamin']").on("change", function () {
    validateField($(this).attr("id") || "jenisKelamin");
  });

 
  // FUNGSI PREVIEW FOTO & VALIDASI UKURAN / FORMAT

  $("#foto").on("change", function () {
    const file = this.files[0];
    const errEl = $("#fotoErr");
    const okEl = $("#fotoOk");
    const preview = $("#previewBox");
    const uploadText = $("#uploadText");

    errEl.hide();
    okEl.hide();
    base64Foto = "";

    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowed.includes(file.type)) {
      errEl.text('Hanya menerima format JPG, JPEG, atau PNG.').slideDown();
      $(this).val('');
      uploadText.text("Pilih File (JPG/PNG, maks. 2MB)");
      return;
    }

    if (file.size > maxSize) {
      errEl.text('Maksimal ukuran file adalah 2 MB.').slideDown();
      $(this).val('');
      uploadText.text("Pilih File (JPG/PNG, maks. 2MB)");
      return;
    }

    // Menggunakan FileReader untuk mengambil base64 data preview
    const reader = new FileReader();
    reader.onload = function (e) {
      base64Foto = e.target.result;
      preview.html(`<img src="${base64Foto}" alt="Preview" />`);
      
      const shortName = file.name.length > 20 ? file.name.slice(0, 20) + '...' : file.name;
      uploadText.text(shortName);
      okEl.text(`✓ Foto berhasil dipilih (${(file.size / 1024 / 1024).toFixed(2)} MB)`).fadeIn();
    };
    reader.readAsDataURL(file);
  });

 
  // SUBMIT FORM (MANIPULASI DOM & ANIMASI JQUERY)
  
  $("#registrationForm").on("submit", function (e) {
    e.preventDefault();

    const fields = ['nim', 'nama', 'email', 'nomorHp', 'jenisKelamin', 'prodi', 'alamat'];
    let formValid = true;

    // Cek semua input teks & pilihan
    fields.forEach(function (field) {
      if (!validateField(field)) formValid = false;
    });

    // Cek validasi file foto
    if (!base64Foto) {
      $("#fotoErr").text("Pas Foto wajib diunggah.").slideDown();
      formValid = false;
    }

    const globalErr = $("#globalError");

    if (!formValid) {
      globalErr.text('⚠ Harap lengkapi semua field yang wajib diisi dengan benar.').slideDown();
      $('html, body').animate({ scrollTop: globalErr.offset().top - 20 }, 'smooth');
      return;
    }

    // JIKA FORM VALID (MANIPULASI DOM UTAMA)
    globalErr.slideUp();

    // Petakan nilai input ke dalam komponen Ringkasan Card
    $("#resNim").text($("#nim").val());
    $("#resNama").text($("#nama").val());
    $("#resEmail").text($("#email").val());
    $("#resHp").text($("#nomorHp").val());
    $("#resGender").text($("input[name='jenisKelamin']:checked").val());
    $("#resProdi").text($("#prodi").val());
    $("#resAlamat").text($("#alamat").val());
    $("#resultPhoto").html(`<img src="${base64Foto}" alt="Foto Resmi" />`);

    // Efek Animasi 3 & 4: FadeOut Form lama, lalu FadeIn Ringkasan Kartu
    $("#registrationForm").fadeOut("fast", function () {
      $("#summaryCard").fadeIn("slow");
    });
  });

  
  // ACTION TOMBOL EDIT DATA (KEMBALI KE FORM)

  $("#btnEdit").on("click", function () {
    $("#summaryCard").fadeOut("fast", function () {
      $("#registrationForm").fadeIn("slow");
    });
  });

  // ACTION TOMBOL RESET FORM

  $("#btnReset").on("click", function () {
    $("#registrationForm")[0].reset();
    $(".error-msg, .success-msg, #globalError").hide().text("");
    $("#uploadText").text("Pilih File (JPG/PNG, maks. 2MB)");
    base64Foto = "";
    // Kembalikan icon svg default pada preview box
    $("#previewBox").html(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
      </svg>
    `);
  });
});