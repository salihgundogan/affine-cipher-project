const TURKISH_ALPHABET = "abcçdefgğhıijklmnoöprsştuüvyz";
const ALPHABET_SIZE = TURKISH_ALPHABET.length; // 29

function formatTextOutput(text, charsPerGroup = 60) {
    let formattedText = '';
    for (let i = 0; i < text.length; i += charsPerGroup) {
        formattedText += text.substring(i, i + charsPerGroup) + ' ';
    }
    return formattedText.trim();
}

function processVigenere(text, key, direction) {
    let result = '';
    text = text.toLowerCase().replace(/[^a-zçğışöü]/g, '');
    key = key.toLowerCase().replace(/[^a-zçğışöü]/g, '');

    if (key.length === 0) {
        return "HATA: Anahtar metin sadece Türkçe harflerden oluşmalıdır.";
    }

    const keyLength = key.length;
    
    for (let i = 0; i < text.length; i++) {
        const plainChar = text[i];
        
        const plainIndex = TURKISH_ALPHABET.indexOf(plainChar);
        if (plainIndex === -1) {
            continue;
        }
        
        const keyChar = key[i % keyLength]; 
        const keyIndex = TURKISH_ALPHABET.indexOf(keyChar);

        if (keyIndex === -1) {
            return "HATA: Anahtar metinde geçersiz karakter bulundu.";
        }

        let newIndex;
        
        if (direction === 1) {
            newIndex = (plainIndex + keyIndex) % ALPHABET_SIZE;
        } else {
            newIndex = (plainIndex - keyIndex); 
            newIndex = (newIndex % ALPHABET_SIZE + ALPHABET_SIZE) % ALPHABET_SIZE;
        }
        
        result += TURKISH_ALPHABET[newIndex];
    }
    return result;
}

function showSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    document.getElementById(sectionId).classList.remove('hidden');
}

showSection('encrypt'); 

function handleEncrypt() {
    const text = document.getElementById('encrypt-text').value;
    const key = document.getElementById('encrypt-key').value;

    if (!text || !key) return alert("Metin ve anahtar giriniz!");

    const result = processVigenere(text, key, 1);
    const formattedResult = formatTextOutput(result);

    document.getElementById('encrypted-output').textContent = formattedResult;
}

function handleDecrypt() {
    const text = document.getElementById('decrypt-text').value;
    const key = document.getElementById('decrypt-key').value;

    if (!text || !key) return alert("Metin ve anahtar giriniz!");
    
    const result = processVigenere(text, key, -1);
    const formattedResult = formatTextOutput(result);

    document.getElementById('decrypted-output').textContent = formattedResult;
}

function handleKeyLength() {
    const cipherText = document.getElementById('length-text').value.toLowerCase().replace(/[^a-zçğışöü]/g, '');
    const maxLength = parseInt(document.getElementById('max-length').value);
    const outputDiv = document.getElementById('length-output');
    outputDiv.innerHTML = ''; 

    if (!cipherText || isNaN(maxLength) || maxLength < 2) {
        return alert("Şifreli metin ve geçerli (min 2) maksimum uzunluk giriniz!");
    }
    
    if (cipherText.length < maxLength * 2) {
        return alert("Analiz için şifreli metin, maksimum uzunluğun en az iki katı kadar uzun olmalıdır.");
    }

    let maxMatchCount = -1;
    let potentialLengths = [];
    let outputHTML = '<ul>';

    for (let k = 1; k <= maxLength; k++) {
        let matchCount = 0;
        
        for (let i = 0; i < cipherText.length - k; i++) {
            if (cipherText[i] === cipherText[i + k]) {
                matchCount++;
            }
        }
        
        outputHTML += `<li>Kaydırma Uzunluğu k=${k}: ${matchCount} adet eşleşme</li>`;
        
        if (matchCount > maxMatchCount) {
            maxMatchCount = matchCount;
            potentialLengths = [k];
        } else if (matchCount === maxMatchCount) {
            potentialLengths.push(k);
        }
    }
    
    outputHTML += '</ul>';
    outputDiv.innerHTML = outputHTML;
    
    if (maxMatchCount > 0) {
        outputDiv.innerHTML += `
            <div style="margin-top: 20px; padding: 10px; border: 2px solid #5cb85c; border-radius: 5px; background-color: #e6ffe6;">
                <strong>EN YÜKSEK EŞLEŞME SAYISI: ${maxMatchCount}</strong><br>
                <strong>MUHTEMEL ANAHTAR UZUNLUĞU:</strong> ${potentialLengths.join(' veya ')}
                <p style="margin-top: 5px; font-size: 0.9em;">(Eşleşmenin en yüksek olduğu değerler, anahtar uzunluğunun katları olabilir.)</p>
            </div>
        `;
    } else {
        outputDiv.innerHTML = '<p>Yeterli eşleşme bulunamadı. Metin uzunluğunu veya maksimum kaydırma değerini artırın.</p>';
    }
}
