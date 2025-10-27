import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export const faqData = [
    {
        category: 'Konfigurasi POS',
        questions: [
            {
                question: 'Bagaimana cara memperbaiki Region Settings dengan benar?',
                answer:
                    '1) Buka Settings → Time & Language → Region. Atur Country/Region: Indonesia.\n' +
                    '2) Klik “Additional date, time & regional settings” → Region → Additional settings.\n' +
                    '   - Decimal symbol: . (titik)\n' +
                    '   - Digit grouping symbol: , (koma)\n' +
                    '   - Short date: dd/MM/yyyy\n' +
                    '   - Currency: Rp dan Currency symbol: Rp\n' +
                    '3) Klik Apply → OK, lalu restart aplikasi POS.\n' +
                    'Catatan: Setelan salah sering menyebabkan harga/qty tidak terbaca benar (misal 1,5 jadi 15).'
            }
        ]
    },
    {
        category: 'Transaksi',
        questions: [
            {
                question: 'Bagaimana caranya penukaran (redeem) Booster Voucher pada POS?',
                answer:
                    '1) Masukkan item belanja seperti biasa.\n' +
                    '2) Buka menu Promo/Voucher di layar pembayaran.\n' +
                    '3) Pilih “Booster Voucher”, lalu scan barcode atau ketik kode voucher.\n' +
                    '4) Sistem akan validasi (masa berlaku, outlet, minimal belanja, syarat penggunaan).\n' +
                    '5) Jika valid, potongan/benefit akan otomatis terapkan pada total.\n' +
                    'Tips: Beberapa voucher tidak dapat digabung. Ikuti aturan yang tercantum pada voucher.'
            },
            {
                question: 'Bagaimana caranya penukaran Voucher Fisik pada POS?',
                answer:
                    '1) Pastikan voucher fisik masih utuh dan belum pernah dipakai.\n' +
                    '2) Pada layar pembayaran, pilih menu “Voucher”, lalu pilih “Voucher Fisik”.\n' +
                    '3) Scan barcode voucher atau input kode secara manual.\n' +
                    '4) Sistem memeriksa status voucher (aktif/kedaluwarsa/terpakai).\n' +
                    '5) Jika valid, nilai potongan diterapkan dan transaksi dapat diselesaikan.\n' +
                    'Jika gagal: periksa masa berlaku, syarat outlet, atau minta supervisor untuk cek status di backoffice.'
            }
        ]
    },
    {
        category: 'Member',
        questions: [
            {
                question: 'Bagaimana caranya input Member ketika transaksi pada POS?',
                answer:
                    '1) Di awal transaksi, pilih “Cari Member”.\n' +
                    '2) Scan kartu member atau cari berdasarkan nomor telepon/nama.\n' +
                    '3) Pilih member yang benar untuk mengaktifkan harga khusus/akumulasi poin.\n' +
                    '4) Jika member belum terdaftar, lakukan pendaftaran singkat (sesuai SOP toko).\n' +
                    'Catatan: Pastikan koneksi ke server aktif agar data member dan benefit ter-update.'
            },
            {
                question: 'Bagaimana caranya menukarkan poin member pada POS?',
                answer:
                    '1) Setelah member terpasang pada transaksi, buka menu “Tukar Poin/Rewards”.\n' +
                    '2) Pilih reward/kupon yang tersedia sesuai saldo poin.\n' +
                    '3) Konfirmasi penukaran; sistem mengurangi poin dan menerapkan reward (diskon/kupon/produk).\n' +
                    '4) Selesaikan transaksi seperti biasa.\n' +
                    'Catatan: Beberapa reward hanya berlaku untuk item tertentu atau memiliki masa berlaku.'
            }
        ]
    },
    {
        category: 'U92',
        questions: [
            {
                question: 'Tidak dapat melakukan Closing pada U92?',
                answer:
                    '1) Pastikan semua transaksi sudah terposting dan tidak ada “pending/suspend”.\n' +
                    '2) Periksa tanggal & jam kasir sesuai server (hindari selisih tanggal).\n' +
                    '3) Cek koneksi jaringan ke server/backoffice.\n' +
                    '4) Coba “Closing Shift” ulang. Jika ada pesan lock/409, minta supervisor lakukan unlock dari backoffice.\n' +
                    '5) Jika masih gagal, restart service aplikasi kasir lalu coba lagi.\n' +
                    'Catatan: Simpan log/error message untuk laporan ke tim IT agar analisis lebih cepat.'
            }
        ]
    }
];


export default function FAQ() {
    return (
        <div className="min-h-screen bg-primary py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold text-neutral-900 mb-16">
                    Frequently asked questions.
                </h1>

                <div className="space-y-12">
                    {faqData.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="space-y-6">
                            <div className="flex gap-2 items-start">
                                <h2 className="text-lg font-medium text-neutral-900 w-40 flex-shrink-0">
                                    {category.category}
                                </h2>

                                <div className="flex-1">
                                    <Accordion type="single" collapsible className="space-y-4">
                                        {category.questions.map((item, questionIndex) => (
                                            <AccordionItem
                                                key={questionIndex}
                                                value={`${categoryIndex}-${questionIndex}`}
                                                className="border border-neutral-200 rounded px-6 bg-white"
                                            >
                                                <AccordionTrigger className="text-left text-base font-normal text-neutral-900 hover:no-underline py-5">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-neutral-600 pb-5">
                                                    {item.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
