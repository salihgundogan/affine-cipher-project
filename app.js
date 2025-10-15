const ENGLISH_ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const ALPHABET_SIZE = ENGLISH_ALPHABET.length; // 26

const VALID_A_KEYS = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

function gcd(a, b) {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function modInverse(a, m) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) {
      return x;
    }
  }
  return null;
}

function formatTextOutput(text, charsPerGroup = 60) {
  let formattedText = "";
  for (let i = 0; i < text.length; i += charsPerGroup) {
    formattedText += text.substring(i, i + charsPerGroup) + " ";
  }
  return formattedText.trim();
}

function processAffine(text, a, b, direction) {
  let result = "";

  text = text.toLowerCase().replace(/[^a-z]/g, "");

  let A = a;
  let B = b;
  let A_INV = null;

  if (direction === -1) {
    A_INV = modInverse(a, ALPHABET_SIZE);
    if (A_INV === null) {
      console.error("HATA: De-şifreleme tersi (a^-1) bulunamadı.");
      return "HATA: Anahtar 'a' tersi alınamaz.";
    }
  }

  for (const char of text) {
    const x = ENGLISH_ALPHABET.indexOf(char);

    if (x === -1) {
      continue;
    }

    let y;

    if (direction === 1) {
      y = (A * x + B) % ALPHABET_SIZE;
    } else {
      y = A_INV * (x - B);
      y = ((y % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;
    }

    result += ENGLISH_ALPHABET[y];
  }
  return result;
}

function showSection(sectionId) {
  document.querySelectorAll(".app-section").forEach((section) => {
    section.classList.add("hidden");
    section.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");
  document.getElementById(sectionId).classList.remove("hidden");
}

showSection("encrypt");

function validateInputs(textId, aId, bId, isEncrypting = true) {
  const text = document.getElementById(textId).value;
  const a = parseInt(document.getElementById(aId).value);
  const b = parseInt(document.getElementById(bId).value);

  if (!text || isNaN(a) || isNaN(b)) {
    alert("Metin, 'a' ve 'b' anahtar değerlerini giriniz!");
    return { valid: false };
  }

  if (gcd(a, ALPHABET_SIZE) !== 1) {
    alert(
      `UYARI: Anahtar 'a' (${a}) uygun değil! EBOB(a, 26) 1 olmalıdır. Lütfen şu değerlerden birini kullanın: ${VALID_A_KEYS.join(
        ", "
      )}`
    );
    return { valid: false };
  }

  if (!isEncrypting && modInverse(a, ALPHABET_SIZE) === null) {
    alert(
      `HATA: De-şifreleme için gerekli olan a'nın çarpımsal tersi (a^-1) bulunamadı. Lütfen 'a' anahtarını kontrol edin.`
    );
    return { valid: false };
  }

  return { valid: true, text, a, b };
}

function handleEncrypt() {
  const validation = validateInputs(
    "encrypt-text",
    "encrypt-a",
    "encrypt-b",
    true
  );

  if (!validation.valid) return;
  const { text, a, b } = validation;

  const result = processAffine(text, a, b, 1);

  const formattedResult = formatTextOutput(result);

  document.getElementById("encrypted-output").textContent = formattedResult;
}

function handleDecrypt() {
  const validation = validateInputs(
    "decrypt-text",
    "decrypt-a",
    "decrypt-b",
    false
  );

  if (!validation.valid) return;
  const { text, a, b } = validation;

  const result = processAffine(text, a, b, -1);

  const formattedResult = formatTextOutput(result);

  document.getElementById("decrypted-output").textContent = formattedResult;
}

function handleCrack() {
  const cipherText = document
    .getElementById("crack-text")
    .value.toLowerCase()
    .replace(/[^a-z]/g, "");
  const outputDiv = document.getElementById("cracked-output");
  outputDiv.innerHTML = "";

  if (!cipherText) return alert("Şifreli metin giriniz!");

  outputDiv.innerHTML += "<h4>Tüm Olası Düz Metin Adayları (260 Olasılık)</h4>";

  for (const a of VALID_A_KEYS) {
    const a_inv = modInverse(a, ALPHABET_SIZE);

    for (let b = 0; b < ALPHABET_SIZE; b++) {
      let decryptedText = "";
      for (const char of cipherText) {
        const y = ENGLISH_ALPHABET.indexOf(char);

        if (y === -1) continue;

        let x = a_inv * (y - b);
        x = ((x % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;

        decryptedText += ENGLISH_ALPHABET[x];
      }

      const formattedOutput = formatTextOutput(decryptedText, 60);

      outputDiv.innerHTML += `
                <p>
                    Anahtar İkilisi (a, b): (${a}, ${b})<br>
                    Olası Düz Metin: <strong>${formattedOutput}</strong>
                </p>
                <hr style="margin: 10px 0;">
            `;
    }
  }
  outputDiv.innerHTML += `<h4>Toplam ${
    VALID_A_KEYS.length * ALPHABET_SIZE
  } olasılık denenmiştir.</h4>`;
}
