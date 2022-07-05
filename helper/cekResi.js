const { fetchJson } = require('./fetcher')

/**
 * Get Resi Information
 *
 * @param {string} ekspedisi - nama ekpedisi
 * @param {string} resi - no / kode resi
 */
module.exports = resi = (ekspedisi, resi) => new Promise((resolve, reject) => {
    fetchJson(`https://api.terhambar.com/resi?resi=${resi}&kurir=${ekspedisi}`)
        .then((result) => {
            if (result.status.code != 200 && result.status.description != 'OK') return resolve(result.status.description)
            // eslint-disable-next-line camelcase
            const { result: { summary, details, delivery_status, manifest } } = result
            const manifestText = manifest.map(x => `• ${x.manifest_date} ${x.manifest_time}\n└ ${x.manifest_description}`)
            const resultText = `*Layanan Cek Nomer Resi*\n
🔍 Status Paket
• ${summary.courier_name}
• Nomor: ${summary.waybill_number}
• Service: ${summary.service_code}
• Dikirim Pada: ${details.waybill_date}  ${details.waybill_time}
    
📌 Nama Penerima
• Nama: ${details.receiver_name}
    
🚚 Status Pengiriman
• ${delivery_status.status}
            
🚚 Detail Pengiriman
${manifestText.join('\n')}`
resolve(resultText)
}).catch((err) => {
    console.error(err)
    reject(err)
})
})