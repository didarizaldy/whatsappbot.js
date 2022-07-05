var request = require('request')
var Promise = require('promise')
/**
 * Get Data Information
 *
 * @param {string} origin - kota origin
 * @param {string} destination - kota destination
 * @param {string} weight - weight
 * @param {string} courier - courier
 */
module.exports = ongkir = (origin, destination, weight, courier) => new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      url: 'http://didarizaldy.my.id/api/rangkircost.php',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      form: {origin: `${origin}`, destination: `${destination}`, weight: `${weight}`, courier: `${courier}`}
    };

    request(options .then((result) => {
      if (result.rajaongkir.status.code != 200 && result.rajaongkir.status.description != 'OK') return resolve(result.rajaongkir.status.description)
      const { result: { rajaongkir, costs } } = result
      const manifestText = costs.map(x => `• ${x.service} ${x.description}\n└ ${x.cost.value}`)
      const resultText = `*Layanan Cek Ongkir*\n
🔍 Status Paket
• Kota Asal : ${rajaongkir.origin_details.city_name}}
• Kota Tujuan : ${rajaongkir.destination_details.city_name}}
• Berat : ${rajaongkir.query.weight}}\n\n
🚚 Kurir : ${rajaongkir.results.name}}

🔍 Detail Ongkir
${manifestText.join('\n')}
`
resolve(resultText)
console.log(result);
}).catch((err) => {
    console.error(err)
    reject(err)
  })
)});