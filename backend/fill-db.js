const axios = require('axios');

async function fill() {
  const url = 'http://3.109.152.88:5000/api';
  console.log("Registering admin...");
  let token;
  try {
    let res = await axios.post(`${url}/auth/register`, { username: "demo_admin", password: "password123", role: "owner", cafeName: "Cloud Cafe" });
    token = res.data.token;
  } catch(e) {
    let res = await axios.post(`${url}/auth/login`, { username: "demo_admin", password: "password123" });
    token = res.data.token;
  }

  console.log("Inserting 4 food items automatically...");
  const items = [
      { name: 'Premium Cloud Burger', category: 'Main Course', price: 12.99, description: 'Delicious backend burger', inStock: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
      { name: 'Serverless Pizza', category: 'Main Course', price: 15.99, description: 'Highly available pizza', inStock: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80' },
      { name: 'EC2 Fries', category: 'Sides', price: 4.99, description: 'Scalable crispy fries', inStock: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80' },
      { name: 'Lambda Lemonade', category: 'Beverages', price: 3.99, description: 'Cold and refreshing', inStock: true, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80' }
  ];
  for(let item of items) {
    try { await axios.post(`${url}/menu`, item, { headers: { 'Authorization': 'Bearer ' + token } }); } catch(e){}
  }
  
  console.log("Creating Chef accounts...");
  try { await axios.post(`${url}/auth/register`, { username: "aws_chef_1", password: "password123", role: "kitchen" }); } catch(e){}
  try { await axios.post(`${url}/auth/register`, { username: "aws_chef_2", password: "password123", role: "kitchen" }); } catch(e){}
  
  console.log("DONE");
}

fill();
