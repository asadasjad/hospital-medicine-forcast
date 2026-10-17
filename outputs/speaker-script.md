# Hospital Medicine Forecasting & Inventory Intelligence
## Slide-by-slide speaker lines

Keep each sentence short. Speak slowly, pause after each bold sentence, and let the slide carry the detail.

### 1. Too much is waste. Too little is risk. — Asad
Hospitals need enough medicine on hand. Too much can expire; too little can cause a shortage. **Our goal is to help find a better balance.**

### 2. One system. Three clear jobs. — Asad
The system has three jobs. It predicts demand, checks the inventory position, and recommends what to order.

### 3. See the next decision in one view. — Yasir
This is the dashboard view. Forecasts, stock, suggested orders and risk appear together, so a team can see the next decision in one place.

### 4. From forecast to action. — Yasir
The dashboard shows predicted demand, available stock, days of supply, risk levels, and a suggested order. The goal is to make the decision easy to read.

### 5. N02BE — Aon
For N02BE, demand is predicted at 901 units. With 700 on hand, 100 incoming, and a 150-unit safety buffer, the prototype recommends 252 units. **Inventory values are demo inputs.**

### 6. Four steps turn history into a plan. — Asad
We start with monthly sales history. The model forecasts demand. The inventory engine combines that forecast with stock and lead-time inputs, then returns an order suggestion and risk flags.

### 7. A simple model. Measured on held-out months. — Asad
We used 70 monthly observations across eight categories, covering 2014 to 2019. We evaluated Linear Regression using a time-based split. The test errors were 60.91 MAE and 118.24 RMSE.

### 8. The order rule is visible and explainable. — Aon
The inventory engine uses predicted demand, on-hand and incoming stock, safety stock, and supplier lead time. It calculates a suggested order and flags stockout or expiry risk.

### 9. Three roles. One connected workflow. — All
**Asad:** I worked on the data and forecasting.  
**Aon:** I built the inventory rules and backend integration.  
**Yasir:** I built the dashboard that brings the results together.

### 10. Predict. Prepare. Prevent. — Asad
Predict demand. Prepare inventory. Prevent avoidable shortages and waste. **Thank you.**

---

**N02BE example note:** The 901.02 predicted demand and 252 recommended order match the saved project output. Current stock, incoming stock, safety stock, and other inventory inputs are demonstration values, not measurements from the sales dataset.
