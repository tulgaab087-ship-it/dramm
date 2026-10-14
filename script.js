document.addEventListener('DOMContentLoaded', () => {
    initSeats();
    loadRegion('ub');
});

// MULTI-SEAT & VIP LOGIC
const seatsGrid = document.getElementById('seatsGrid');
const selectedSeatEl = document.getElementById('selectedSeat');
const totalPriceEl = document.getElementById('totalPrice');
const payBtn = document.getElementById('payBtn');

let selectedSeats = [];

const VIP_PRICE = 45000;
const REGULAR_PRICE = 25000;

function initSeats() {
    seatsGrid.innerHTML = '';
    selectedSeats = [];
    updateSummary();

    for (let i = 1; i <= 24; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        
        const isVip = i <= 8;
        const price = isVip ? VIP_PRICE : REGULAR_PRICE;

        if (isVip) {
            seat.classList.add('vip');
            seat.innerHTML = `<i class="fa-solid fa-crown" style="font-size:10px;"></i> ${i}`;
        } else {
            seat.innerText = i;
        }

        if (i === 6 || i === 7 || i === 15) {
            seat.classList.add('occupied');
        } else {
            seat.addEventListener('click', () => toggleSeatSelection(i, price, isVip, seat));
        }
        seatsGrid.appendChild(seat);
    }
}

function toggleSeatSelection(number, price, isVip, element) {
    const existingIndex = selectedSeats.findIndex(s => s.number === number);

    if (existingIndex > -1) {
        selectedSeats.splice(existingIndex, 1);
        element.classList.remove('selected');
    } else {
        selectedSeats.push({ number, price, isVip });
        element.classList.add('selected');
    }

    updateSummary();
}

function updateSummary() {
    if (selectedSeats.length === 0) {
        selectedSeatEl.innerText = "Сонгоогүй";
        totalPriceEl.innerText = "0₮";
        payBtn.disabled = true;
        return;
    }

    const seatNumbers = selectedSeats.map(s => `${s.number}${s.isVip ? ' (VIP)' : ''}`).join(', ');
    const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    selectedSeatEl.innerText = `${seatNumbers} (${selectedSeats.length} суудал)`;
    totalPriceEl.innerText = `${total.toLocaleString()}₮`;
    payBtn.disabled = false;
}

// QPAY MODAL
function openQPayModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const seatNumbers = selectedSeats.map(s => `${s.number}${s.isVip ? ' (VIP)' : ''}`).join(', ');

    modalBody.innerHTML = `
        <h3 style="color: var(--accent-gold); margin-bottom: 10px;">QPay-ээр Төлбөр Төлөх</h3>
        <p>Сонгосон: <strong>${seatNumbers}</strong></p>
        <p>Нийт суудал: <strong>${selectedSeats.length} ширхэг</strong></p>
        <p>Нийт дүн: <strong style="color: var(--accent-gold); font-size: 1.2rem;">${total.toLocaleString()}₮</strong></p>
        <div style="text-align:center; margin: 20px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=UDET_QPay_Demo" alt="QPay QR" style="border-radius: 8px; border: 2px solid var(--accent-gold);">
        </div>
        <button class="btn primary-btn full-width" onclick="confirmPayment()">
            <i class="fa-solid fa-check"></i> Төлбөр шалгах
        </button>
    `;
    modal.style.display = 'flex';
}

function confirmPayment() {
    alert(`Амжилттай! Таны сонгосон ${selectedSeats.length} суудлын QR тасалбар амжилттай баталгаажлаа.`);
    initSeats();
    closeModal();
}

// DIGITAL THEATRE RENTAL
function openRentalModal(title, price) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h3 style="color: var(--accent-gold); margin-bottom: 10px;">🎬 ${title}</h3>
        <p>Түрээсийн хугацаа: <strong>48 цаг</strong></p>
        <p>Чанар: <strong>Full HD / DRM Хамгаалалттай</strong></p>
        <p>Үнэ: <strong style="color: var(--accent-gold);">${price.toLocaleString()}₮</strong></p>
        <button class="btn primary-btn full-width" style="margin-top:20px;" onclick="alert('Онлайн үзэх эрх идэвхжлээ!')">
            <i class="fa-solid fa-credit-card"></i> Үзэх Эрх Авах
        </button>
    `;
    modal.style.display = 'flex';
}

function openTrailerModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h3 style="color: var(--accent-gold); margin-bottom: 15px;">"Анна Каренина" Трейлер</h3>
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px;">
            <iframe style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
        </div>
    `;
    modal.style.display = 'flex';
}

// REGIONAL THEATRES DATA
const regionData = {
    ub: { name: "Улсын Драмын Эрдмийн Театр", city: "Улаанбаатар хот", desc: "1931 онд байгуулагдсан Монгол улсын драмын урлагийн цөм театр." },
    arkhangai: { name: "Архангай аймгийн Хөгжимт Драмын Театр", city: "Архангай, Цэцэрлэг хот", desc: "Арын сайхан хангай нутгийн соёл урлагийн голомт болсон анхны орон нутгийн театруудын нэг." },
    khovsgol: { name: "Хөвсгөл аймгийн 'Хонгороо' Театр", city: "Хөвсгөл, Мөрөн хот", desc: "Хойд бүсийн хүүхэд залуучууд, ард иргэдэд урлагийн боловсрол олгох төв." },
    dornod: { name: "Дорнод аймгийн Хөгжимт Драмын Театр", city: "Дорнод, Чойбалсан хот", desc: "Зүүн бүсийн уран бүтээлчдийн түүхэн өв, театр урлагийн уурхай." }
};

function loadRegion(key, event) {
    const info = regionData[key];
    const infoContainer = document.getElementById('regionInfo');
    
    if (event) {
        document.querySelectorAll('.region-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }

    infoContainer.innerHTML = `
        <h3 style="color: var(--accent-gold); margin-bottom: 10px;">${info.name}</h3>
        <p style="margin-bottom: 8px;"><strong>Байршил:</strong> ${info.city}</p>
        <p style="color: var(--text-gray);">${info.desc}</p>
    `;
}

function showYearDetails(year) {
    alert(`${year} оны театрын ховор архивын зураг, сонин нийтлэлүүдийн сан нээгдэж байна.`);
}

function submitScript(event) {
    event.preventDefault();
    alert("Таны жүжгийн зохиолыг Уран сайхны зөвлөл хүлээн авлаа. Баярлалаа!");
    event.target.reset();
}

function toggleProfile() {
    alert("Хэрэглэгчийн 'Миний Театр' хэсэг: Хадгалсан жүжгүүд болон идэвхтэй тасалбарууд энд харагдана.");
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}