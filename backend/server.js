const express = require('express');
const Razorpay = require('razorpay');
require('dotenv').config();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');


const razorpayInstance = new Razorpay({     //razorpay keys
	key_id: process.env.KEY_ID,
	key_secret: process.env.KEY_SECRET,
});

const app = express()
 
app.use(cors());      //for cross request
const PORT = process.env.PORT || '5000';

// app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());

var order_id = "";



app.post('/createorder', (req, res)=>{			//create order_id
	const {amount,currency,receipt, notes} = req.body;	
	console.log(req.body);	
	razorpayInstance.orders.create({amount, currency, receipt, notes},
		(err, order)=>{	
		if(!err){
			res.json(order)
			order_id = order.id
		}
		else
			res.send(err);
		}
	)
});


app.post('/verifyorder', (req, res)=>{				//this is not used yet
	
	const {order_id, payment_id} = req.body;	
	const razorpay_signature = req.headers['x-razorpay-signature'];

	const key_secret = process.env.KEY_SECRET;	

	let hmac = crypto.createHmac('sha256', key_secret);

	hmac.update(order_id + "|" + payment_id);
	
	const generated_signature = hmac.digest('hex');
	
	if(razorpay_signature===generated_signature){
		res.json({success:true, message:"Payment has been verified"})
	}
	else
	res.json({success:false, message:"Payment verification failed"})
});


app.get('/orderid',(req,res)=>{				//get request for order_id
	res.json({order_id})
})


app.listen(PORT, () => {
	console.log("Server is Listening on Port ", PORT);
});








