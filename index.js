const express = require('express');
const catalystSDK = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const catalyst = catalystSDK.initialize(req);
  res.locals.catalyst = catalyst;
  next();
});

app.get('/all', async (req, res) => {
	try {
	  const { catalyst } = res.locals;
	  const zcql = catalyst.zcql();
	  let query = `SELECT ROWID, Order_Date, Customer_Name, Item_Name, Quantity, Weight, Check_me FROM AppStore`;
  
	  // Check if any query parameters are provided
	  if (req.query.ROWID) {
		// If id parameter is provided, filter the results based on id
		query += ` WHERE ROWID = '${req.query.ROWID}'`;
	  }
  
	  const myData = await zcql.executeZCQLQuery(query);
  
	  const orders = myData.map(row => ({
		id: row.AppStore.ROWID,
		order_date: row.AppStore.Order_Date,
		cust: row.AppStore.Customer_Name,
		item: row.AppStore.Item_Name,
		qty: row.AppStore.Quantity,
		wt: row.AppStore.Weight,
		chk: row.AppStore.Check_me
	  }));
  
	  res.status(200).send({
		status: 'success',
		data: {
		  orders
		}
	  });
	} catch (err) {
	  console.log("function error");
	  console.log(err);
	  res.status(500).send({
		status: 'failure',
		message: "We're unable to process the request."
	  });
	}
  });
  
  
app.post('/add', async (req, res) => {
	try {
	  const { ord_date,cust,item,qty,wt,chk } = req.body;
	  const { catalyst } = res.locals;
	  const table = catalyst.datastore().table('AppStore');
	  const { ROWID: id } = await table.insertRow({
		Order_Date : ord_date,
		Customer_Name : cust,
		Item_Name : item,
		Quantity : qty,
		Weight : wt,
		Check_me : chk
	  });
	  res.status(200).send({
		status: 'success',
		data: {
		  id,
		  ord_date,
		  cust,
		  item,
		  qty,
		  wt,
		  chk
		}
	  });
	} catch (err) {
	  console.log(err);
	  res.status(500).send({
		status: 'failure',
		message: "We're unable to process the request."
	  });
	}
  })
  app.put('/:ROWID', async (req, res) => {
    try {
        const { ROWID } = req.params;
        const { Order_Date, Customer_Name, Item_Name, Quantity, Weight, Check_me } = req.body;
        const { catalyst } = res.locals;
		console.log("fisrt step");
        const table = catalyst.datastore().table('AppStore');

		console.log("DB start");
		const existingRow = await table.getRow(ROWID);

		// Update the fields
		existingRow.Order_Date = Order_Date;
		existingRow.Customer_Name = Customer_Name;
		existingRow.Item_Name = Item_Name;
		existingRow.Quantity = Quantity;
		existingRow.Weight = Weight;
		existingRow.Check_me = Check_me;
	    console.log("updated db")
		// Save the updated row
		await existingRow.save();
	    console.log("save db")
		res.status(200).send({
		  status: 'success',
		  data: {
			id: ROWID,
			ord_date,
			cust,
			item,
			qty,
			wt,
			chk
		  }
		});
	  }  catch (err) {
        console.log(err);
        res.status(500).send({
            status: 'failure',
            message: "We're unable to process the request."
        });
    }
});


  app.delete('/:ROWID', async (req, res) => {
	try {
	const { ROWID } = req.params;
	const { catalyst } = res.locals;
	const table = catalyst.datastore().table('AppStore');
	await table.deleteRow(ROWID);
	res.status(200).send({
	status: 'success',
	data: {
	Recipes: {
	id: ROWID
	}
	}
	});
	} catch (err) {
	console.log(err);
	res.status(500).send({
	status: 'failure',
	message: "We're unable to process the request."
	});
	}
	});
  module.exports = app;