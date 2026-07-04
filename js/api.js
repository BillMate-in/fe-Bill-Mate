/**
 * BILLMATE - GLOBAL API SERVICE GATEWAY
 * Pengembang: Erynd (Senior Backend Engineer & Tech Mentor)
 * 
 * Kelas ini mengisolasi konfigurasi HTTP request ke server Laravel lokal Anda.
 * Dengan pola ini, jika URL server berubah atau terdapat penambahan header keamanan,
 * Anda hanya perlu melakukan pembaruan di dalam berkas tunggal ini saja.
 */
class BillMateAPI {
    constructor() {
        // Base URL mengarah ke server Laravel lokal Anda
        this.baseUrl = 'http://bill-mate.web.id.preview.services/api';
    }

    /**
     * Mengirim payload data split-bill mentah untuk dihitung oleh server backend.
     * 
     * @param {Object} payload - Objek data pesanan, anggota, dan biaya tambahan
     * @returns {Promise<Object>} Respons JSON terurai dari backend
     */
    async calculateSplitBill(payload) {
        const response = await fetch(`${this.baseUrl}/split-bill/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        return this._handleResponse(response);
    }

    /**
     * Mengirim data final rincian room untuk diarsipkan oleh backend.
     * 
     * @param {Object} payload 
     * @returns {Promise<Object>} Respons JSON terurai dari backend
     */
    async archiveRoom(payload) {
        const response = await fetch(`${this.baseUrl}/split-bill/archive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        return this._handleResponse(response);
    }

    /**
     * Helper internal untuk memvalidasi status HTTP sebelum melakukan parsing JSON.
     * Menangani error penanganan backend secara terpusat (seperti HTTP 422 untuk validasi gagal).
     * 
     * @param {Response} response - Objek Fetch Response mentah
     * @returns {Promise<Object>}
     * @private
     */
    async _handleResponse(response) {
        const data = await response.json();
        
        // Jika respons tidak berada di rentang HTTP status 2xx (misal 422 atau 500)
        if (!response.ok) {
            // Buat error terstruktur dengan menangkap pesan eror dari Laravel validator
            const errorMessage = data.message || `API Error: Status ${response.status}`;
            const error = new Error(errorMessage);
            error.response = data; // Tempelkan detail respons eror jika dibutuhkan di UI
            throw error;
        }
        
        return data;
    }
}

// Pasangkan instansiasi kelas ini ke objek 'window' global browser
// Sekarang, Anda bisa memanggil 'window.billMateAPI' langsung dari berkas JS mana saja.
window.billMateAPI = new BillMateAPI();