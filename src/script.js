// Variable global maximum
let maxSequence = []
let maxCoords = []
let maxReward = 0
let elapsedTime = 0

// Kalau input dari file
function inputTextFile() {
    // Menampilkan opsi input dari file
    document.getElementById("textFileInput").classList.remove("hidden");
    document.getElementById("userInput").classList.add("hidden");
    document.getElementById("debugContainer").classList.add("hidden");
}

// Kalau input dari user
function inputUser() {
    // Menampilkan opsi input dari user
    document.getElementById("userInput").classList.remove("hidden");
    document.getElementById("textFileInput").classList.add("hidden");
    document.getElementById("debugContainer").classList.add("hidden");
}

// Memproses file
async function loadTextFile() {
    // Mengambil nama file
    let filetxt = document.getElementById("fileInput").value.trim();
  
    // Fetch file content
    const response = await fetch(filetxt);
    const fileContent = await response.text();

    // Split isi file berdasarkan enter
    const lines = fileContent.trim().split('\n');

    // Instantiasi iterasi baris
    let line_num = 0;

    // Mengambil jumlah buffer
    const bufferSize = parseInt(lines[line_num++]);

    // Mengambil panjang dan lebar matrix
    const [matrixWidth, matrixHeight] = lines[line_num++].split(' ').map(Number);

    // Instantiasi matrix dan mengisi matrix
    const matrix = new Array(matrixHeight);
    for (let i = 0; i < matrixHeight; i++) {
        matrix[i] = new Array(matrixWidth);
    }
    for (let i = 0; i < matrixHeight; i++) {
        const elements = lines[line_num++].trim().split(' ');
        for (let j = 0; j < matrixWidth; j++) {
            matrix[i][j] = elements[j];
        }
    }

    // Mengambil banyak sequence
    const numberOfSequence = parseInt(lines[line_num++]);

    // Instantiasi array sequence dan sequenceReward dan diisi
    const sequences = [];
    for (let i = 0; i < numberOfSequence; i++) {
        const sequence = lines[line_num++].trim().split(' ');
        const sequenceReward = parseInt(lines[line_num++].trim());
        sequences.push({ sequence, sequenceReward });
    }

    // Print untuk debug
    console.log("Buffer Size:", bufferSize);
    console.log("Matrix Width:", matrixWidth);
    console.log("Matrix Height:", matrixHeight);
    console.log(matrix);
    console.log(numberOfSequence);
    console.log(sequences);

    processSequence(bufferSize, matrixHeight, matrixWidth, matrix, tokens, sequences);
    
}

// Memproses input
function submitUser() {
    // Mengambil data
    bufferSize = parseInt(document.getElementById("bufferSize").value);
    numberOfTokens = parseInt(document.getElementById("numberOfTokens").value);
    tokens = document.getElementById("tokens").value.trim().split(" ");
    matrixWidth = parseInt(document.getElementById("matrixWidth").value);
    matrixHeight = parseInt(document.getElementById("matrixHeight").value);
    sequenceAmount = parseInt(document.getElementById("sequenceAmount").value);
    maximumSequenceContent = parseInt(document.getElementById("maximumSequenceContent").value);
    
    // Generate matrix
    const matrix = new Array(matrixHeight);
    for (let i = 0; i < matrixHeight; i++) {
        matrix[i] = new Array(matrixWidth);
    }
    for (let i = 0; i < matrixHeight; i++) {
        for (let j = 0; j < matrixWidth; j++) {
            tokenIndex = Math.floor(Math.random() * numberOfTokens);
            matrix[i][j] = tokens[tokenIndex];
        }
    }

    // Generate sequences dan sequenceReward
    const sequences = [];
    for (let i = 0; i < sequenceAmount; i++) {
        const sequence = []
        const sequenceContent = Math.floor(Math.random() * (maximumSequenceContent - 2 + 1)) + 2;;
        for (let j = 0; j < sequenceContent; j++) {
            tokenIndex = Math.floor(Math.random() * numberOfTokens);
            sequence.push(tokens[tokenIndex]);
        }
        const sequenceReward = Math.floor(Math.random() * 100)
        sequences.push({ sequence, sequenceReward });
    }
    
    // Print untuk debug
    console.log("Buffer Size:", bufferSize);
    console.log("Number of Tokens", numberOfTokens);
    console.log("Matrix Width:", matrixWidth);
    console.log("Matrix Height:", matrixHeight);
    console.log("Tokens:", tokens);
    console.log("Matrix: ", matrix);
    console.log("Sequences: ", sequences);

    processSequence(bufferSize, matrixHeight, matrixWidth, matrix, tokens, sequences);

}

// Saatnya mengproses
function processSequence(bufferSize, matrixHeight, matrixWidth, matrix, tokens, sequences) {
    document.getElementById("debugContainer").classList.remove("hidden");

    // Memulai timer
    const startTime = performance.now();

    // Membuat array sequence untuk mengecek apakah sudah di visit atau belum
    let sequenceVisited = new Array(sequences.length);
    for (let i = 0; i < sequences.length; i++) {
        sequenceVisited[i] = 0;
    }
    
    // Membuat matrix untuk mengecek apakah sudah di visit atau belum
    let matrixVisited = [];
    for (let i = 0; i < matrixHeight; i++) {
        const row = []
        for (let j = 0; j < matrixWidth; j++) {
          row.push(0)
        }
        matrixVisited.push(row)
    }

    // Buat array kosong untuk menyimpan sequence yang terpakai dan koordinatnya
    let coordSequence = [];
    let savedSequence = [];

    startCheckSequence(matrix, sequences, matrixWidth, matrixHeight, sequenceVisited, matrixVisited, coordSequence, savedSequence, bufferSize)

    // Menghentikan timer dan menghitung lama waktu yang dibutuhkan
    const endTime = performance.now();
    elapsedTime = endTime - startTime;
    console.log("Lama waktu eksekusi: " + elapsedTime + " milliseconds");

    displayResult();

}

// Fungsi untuk memulai iterasi pengecekan sequence dalam matrix
function startCheckSequence(matrix, sequences, matrixWidth, matrixHeight, sequenceVisited, matrixVisited, coordSequence, savedSequence, bufferSize) {
    for (let i = 0; i < sequences.length; i++) {
        // Iterasi sebanyak banyak kolom
        for (let j = 0; j < matrixWidth; j++) {
            cekSatuKolom(matrix, j, 0, matrixVisited, matrixWidth, matrixHeight, sequences, sequences[i].sequence, sequenceVisited, 0, coordSequence, savedSequence, bufferSize)
        }
    }
}

// Fungsi untuk melanjutkan cek ke sequence lain
function continueCheckSequence (matrix, matrixVisited, matrixWidth, matrixHeight, sequences, sequenceVisited, currReward, coordSequence, savedSequence, cond, startIndex, bufferSize) {
    for (let i = 0; i < sequences.length; i++) {
        // Untuk sequence yang belum pernah digunakan
        if (sequenceVisited[i] == 0) {
            // Cek apakah sequence tersebut ada pada sequence yang sudah ada
            if (isSubstring(savedSequence, sequences[i].sequence)) {
                console.log()
                console.log("-- SELESAI! -- ");
                currReward += sequences[i].sequenceReward;
                console.log("Current reward:", currReward);
                console.log("All coords:", coordSequence);
                console.log("All tokens saved:", savedSequence);
                console.log()

                // Cek maks
                isMore(savedSequence, coordSequence, currReward);

                // Mencatat bahwa sequence ini sudah selesai
                let currSequenceIndex = i;
                let sequenceVisited_copy = [...sequenceVisited];
                sequenceVisited_copy[currSequenceIndex] = 1;

                // Lanjut sequence lain
                continueCheckSequence(matrix, matrixVisited, matrixWidth, matrixHeight, sequences, sequenceVisited_copy, currReward, coordSequence, savedSequence, cond, startIndex, bufferSize);
            } else { // Cek apakah sequence tersebut merupakan subset
                // Cari di mana (kalau tidak subset return 0)
                
                let seqStartIndex = checkStartIndex(savedSequence, sequences[i].sequence);
                if (cond === "baris") {
                    cekSatuBaris(matrix, startIndex, seqStartIndex, matrixVisited, matrixWidth, matrixHeight, sequences, sequences[i].sequence, sequenceVisited, currReward, coordSequence, savedSequence, bufferSize);
                } else {
                    cekSatuKolom(matrix, startIndex, seqStartIndex, matrixVisited, matrixWidth, matrixHeight, sequences, sequences[i].sequence, sequenceVisited, currReward, coordSequence, savedSequence, bufferSize);
                }
            }
        }
    }
}

// Fungsi untuk iterasi dalam satu kolom
function cekSatuKolom(matrix, col, index, matrixVisited, matrixWidth, matrixHeight, sequences, sequence, sequenceVisited, currReward, coordSequence, savedSequence, bufferSize) {
    // Cek apakah sequence sudah berakhir belum dan cek apakah buffer sudah penuh
    if ((!check(index, sequence)) && (savedSequence.length < bufferSize)) {
        // Looping sebanyak tinggi matrix / banyak baris
        for (let i = 0; i < matrixHeight; i++) {
            // Jika sama dengan yang dicek dengan sequence,
            if ((matrix[i][col] == sequence[index]) && (matrixVisited[i][col] != 1)) {
                // Simpan koordinatnya, tokennya, dan tandai kalau sudah dicek
                console.log("Baris", i+1, "kolom", col+1, "=", matrix[i][col]);

                let coordSequence_copy = [...coordSequence];
                coordSequence_copy.push([col+1, i+1]); // Ingat (col, row)

                let savedSequence_copy = [...savedSequence];
                savedSequence_copy.push(matrix[i][col]);

                let matrixVisited_copy = JSON.parse(JSON.stringify(matrixVisited));
                matrixVisited_copy[i][col] = 1;

                // Saatnya ngecek baris
                cekSatuBaris(matrix, i, index+1, matrixVisited_copy, matrixWidth, matrixHeight, sequences, sequence, sequenceVisited, currReward, coordSequence_copy, savedSequence_copy, bufferSize);
            }
        }
    } else {
        console.log()
        console.log("-- SELESAI! -- ");
        currReward += sequences[sequenceIndex(sequence, sequences)].sequenceReward;
        console.log("Current reward:", currReward);
        console.log("All coords:", coordSequence);
        console.log("All tokens saved:", savedSequence);
        console.log()

        // Cek maks
        isMore(savedSequence, coordSequence, currReward);

        // Mencatat bahwa sequence ini sudah selesai
        let currSequenceIndex = sequenceIndex(sequence, sequences);
        let sequenceVisited_copy = [...sequenceVisited];
        sequenceVisited_copy[currSequenceIndex] = 1;

        // Lanjut sequence lain
        continueCheckSequence(matrix, matrixVisited, matrixWidth, matrixHeight, sequences, sequenceVisited_copy, currReward, coordSequence, savedSequence, "kolom", col, bufferSize);
    }
}

// Fungsi untuk iterasi dalam satu baris
function cekSatuBaris(matrix, row, index, matrixVisited, matrixWidth, matrixHeight, sequences, sequence, sequenceVisited, currReward, coordSequence, savedSequence, bufferSize) {
    // Cek apakah sequence sudah berakhir belum dan cek apakah buffer sudah penuh
    if ((!check(index, sequence)) && (savedSequence.length < bufferSize)) {
        // Looping sebanyak panjang matrix / banyak kolom
        for (let i = 0; i < matrixWidth; i++) {
            // Jika sama dengan yang dicek dengan sequence,
            if ((matrix[row][i] == sequence[index]) && (matrixVisited[row][i] != 1)) {
                // Simpan koordinatnya, tokennya, dan tandai kalau sudah dicek
                console.log("Baris", row+1, "kolom", i+1, "=", matrix[row][i]);

                let coordSequence_copy = [...coordSequence];
                coordSequence_copy.push([i+1, row+1]); // Ingat (col, row)

                let savedSequence_copy = [...savedSequence];
                savedSequence_copy.push(matrix[row][i]);

                let matrixVisited_copy = JSON.parse(JSON.stringify(matrixVisited));
                matrixVisited_copy[row][i] = 1;

                // Saatnya ngecek baris
                cekSatuKolom(matrix, i, index+1, matrixVisited_copy, matrixWidth, matrixHeight, sequences, sequence, sequenceVisited, currReward, coordSequence_copy, savedSequence_copy, bufferSize)
            }
        }
    } else {
        console.log()
        console.log("-- SELESAI! -- ");
        currReward += sequences[sequenceIndex(sequence, sequences)].sequenceReward;
        console.log("Current reward:", currReward);
        console.log("All coords:", coordSequence);
        console.log("All tokens saved:", savedSequence);
        console.log()

        // Cek maks
        isMore(savedSequence, coordSequence, currReward);

        // Mencatat bahwa sequence ini sudah selesai
        let currSequenceIndex = sequenceIndex(sequence, sequences);
        let sequenceVisited_copy = [...sequenceVisited];
        sequenceVisited_copy[currSequenceIndex] = 1;

        // Lanjut sequence lain
        continueCheckSequence(matrix, matrixVisited, matrixWidth, matrixHeight, sequences, sequenceVisited_copy, currReward, coordSequence, savedSequence, "baris", row, bufferSize);
    }
}

function displayResult() {
    document.getElementById("max-sequence").textContent = JSON.stringify(maxSequence);
    document.getElementById("max-coords").textContent = JSON.stringify(maxCoords);
    document.getElementById("max-reward").textContent = maxReward;
    document.getElementById("elapsed-time").textContent = elapsedTime;

}

// Fungsi-fungsi tambahan
function check(index, sequence) {
    // Fungsi untuk mengecek apakah index merupakan index maks dari
    // sequence + 1 atau bisa dibilang sama dengan panjang sequencenya
    return index == sequence.length;
}

function sequenceIndex(sequence, sequences) {
    // Fungsi untuk mencari index sequence terkini pada database sequences
    // Pasti ditemukan
    for (let i = 0; i < sequences.length; i++) {
        if (JSON.stringify(sequence) == JSON.stringify(sequences[i].sequence)) {
            return i;
        }
    }
}

function isSubstring (savedSequence, sequence) {
    // Fungsi untuk mencari apakah sebuah sequence sudah terdapat
    // pada sequence lain yang sudah diproses 
    return sequence.join('').includes(savedSequence.join(''));
}

function checkStartIndex (savedSequence, sequence) {
    // Akan ada kasus di mana awal sebuah sequence berada pada akhir sequence lain
    // Fungsi untuk mengecek sampai index berapa sequence yang telah diproses 
    // beririsan dengan sequence lain
    // Mengembalikan 0 jika tidak beririsan
    // Asumsi not isSubstring
    for (let i = 0; i < savedSequence.length; i++) {
        if (savedSequence.slice(-i).join('') === sequence.slice(0, i).join('')) {
            return i;
        }
    }
    return 0;
}

function isMore (sequence, coords, reward) {
    // Prosedur untuk mengecek apakah sequence yang dimiliki sekarang merupakan seq
    // dengan reward terbanyak atau tidak
    if (reward > maxReward) {
        maxReward = reward;
        maxCoords = coords;
        maxSequence = [...sequence];
    }
    console.log("Sequence terbaik:", maxSequence);
    console.log("Koordinat: ", maxCoords);
    console.log("Reward terbesar:", maxReward);
}