// 1. АПП-ЫН ЭХНИЙ СУУДЛЫН МЭДЭЭЛЛИЙГ ҮҮСГЭХ (DOM LOADED)
document.addEventListener('DOMContentLoaded', () => {
    initSeats();
    loadRegion('ub'); // Эхлээд Улаанбаатар театрыг ачаална
});

// 2. СУУДЛЫН СЕТКА АЖИЛЛУУЛАХ LOGIC
const seatsGrid = document.getElementById('seatsGrid');
const selectedSeatEl = document.getElementById('selectedSeat');
const totalPriceEl = document.getElementById('totalPrice');
const payBtn = document.getElementById('payBtn');

let selectedSeatNumber = null;
const seatPrice = 25000; // Нэг суудлын үнэ: 25,000₮

function initSeats() {
    seatsGrid.innerHTML = '';
    for (let i = 1; i <= 24; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        seat.innerText = i;

        // Зарим суудлыг зарагдсан болгож загварчлах
        if (i === 5 || i === 12) {
            seat.classList.add('occupied');
        } else {
            seat.addEventListener('click', () => selectSeat(i, seat));
        }
        seatsGrid.appendChild(seat);
    }
}

function selectSeat(number, element) {
    // Өмнө сонгосон суудлын классыг арилгах
    const currentSelected = document.querySelector('.seat.selected');
    if (currentSelected) {
        currentSelected.classList.remove('selected');
    }

    element.classList.add('selected');
    selectedSeatNumber = number;
    
    // UI мэдээллийг шинэчлэх
    selectedSeatEl.innerText = `${number}-р суудал`;
    totalPriceEl.innerText = `${seatPrice.toLocaleString()}₮`;
    payBtn.disabled = false;
}

// 3. QPAY POPUP ХАРУУЛАХ
function openQPayModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h3 style="color: var(--accent-gold)">QPay-ээр Төлбөр Төлөх</h3>
        <p>Сонгосон суудал: <strong>${selectedSeatNumber}-р суудал</strong></p>
        <p>Нийт дүн: <strong>${seatPrice.toLocaleString()}₮</strong></p>
        <div style="text-align:center; margin: 20px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=QPay_Demo_Payment" alt="QPay QR">
        </div>
        <button class="btn primary-btn" style="width:100%" onclick="confirmPayment()">Төлбөр шалгах</button>
    `;
    modal.style.display = 'flex';
}

function confirmPayment() {
    alert('Төлбөр амжилттай баталгаажлаа! Таны QR тасалбар имэйлээр очлоо.');
    closeModal();
}

// 4. ЦАХИМ ТАЙЗ ТҮРЭЭСЛЭХ MODAL
function openRentalModal(title, price) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h3>🎬 ${title}</h3>
        <p>Түрээсийн хугацаа: <strong>48 цаг</strong></p>
        <p>Үнэ: <strong>${price.toLocaleString()}₮</strong></p>
        <button class="btn primary-btn" style="width:100%; margin-top:15px;" onclick="alert('Цахим тайзын эрх идэвхжлээ!')">Үзэх эрх авах</button>
    `;
    modal.style.display = 'flex';
}

// 5. МОНГОЛЫН ТЕАТРУУД ХҮСНЭГТ СУУЛГАХ
const regionData = {
    ub: { name: "Улсын Драмын Эрдмийн Театр", city: "Улаанбаатар", desc: "1931 онд байгуулагдсан Монгол улсын драмын урлагийн цөм театр." },
    arkhangai: { name: "Архангай аймгийн Хөгжимт Драмын Театр", city: "Архангай, Цэцэрлэг хот", desc: "Орон нутгийн уран бүтээлчдийн түүхэн төв." },
    khovsgol: { name: "Хөвсгөл аймгийн 'Хонгороо' Театр", city: "Хөвсгөл, Мөрөн хот", desc: "Хойд бүсийн соёл урлагийн гол голомт." }
};

function loadRegion(key) {
    const info = regionData[key];
    const infoContainer = document.getElementById('regionInfo');
    
    // Идэвхтэй товчийг солих
    document.querySelectorAll('.region-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    infoContainer.innerHTML = `
        <h3>${info.name}</h3>
        <p><strong>Байршил:</strong> ${info.city}</p>
        <p>${info.desc}</p>
    `;
}

// 6. ТҮҮХЭН ОН СУДЛАХ
function showYearDetails(year) {
    alert(`${year} оны театрын онцлох архивын материал болон зурагнууд нээгдлээ.`);
}

// 7. ЗОХИОЛ ИЛГЭЭХ FORM
function submitScript(event) {
    event.preventDefault();
    alert("Таны жүжгийн зохиолыг амжилттай хүлээн авлаа. Уран сайхны зөвлөл хянаад хариу мэдээлэх болно.");
    event.target.reset();
}

// MODAL ЦОНХ ИДАВХГҮЙ БОЛГОХ
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}