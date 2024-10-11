import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { html } from 'hono/html'
import { streamToBuffer } from 'hono/utils/stream'

const app = new Hono()

// Mock function to simulate receipt analysis
function mockReceiptAnalysis() {
  return {
    store_name: "Grocery Store XYZ",
    date: "2024-03-15",
    total_amount: "$37.85",
    items: [
      { name: "Milk", price: "$3.99" },
      { name: "Bread", price: "$2.49" },
      { name: "Eggs", price: "$4.99" },
      { name: "Cheese", price: "$5.99" },
      { name: "Apples", price: "$3.49" },
      { name: "Chicken", price: "$8.99" },
      { name: "Pasta", price: "$1.99" },
      { name: "Tomato Sauce", price: "$1.99" },
      { name: "Ice Cream", price: "$3.99" }
    ]
  }
}

// Update the root route to include a form
app.get('/', (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt Scanner</title>
    </head>
    <body>
      <h1>Receipt Scanner</h1>
      <form action="/scan-receipt" method="post" enctype="multipart/form-data">
        <input type="file" name="receipt" accept="image/*" capture="environment">
        <button type="submit">Scan Receipt</button>
      </form>
    </body>
    </html>
  `)
})

// Update the route to handle receipt scanning
app.post('/scan-receipt', async (c) => {
  const { receipt } = await c.req.parseBody()
  
  if (!(receipt instanceof File)) {
    return c.text('No file uploaded', 400)
  }

  // Convert the file to a buffer (we're not using it, but keeping for future use)
  //await streamToBuffer(receipt.stream())

  // Use the mock function instead of calling the API
  const receiptData = mockReceiptAnalysis()

  // Generate a random ID for the receipt
  const receiptId = Math.floor(Math.random() * 1000000).toString()

  // In a real app, you would save receiptData to a database here

  // Redirect to the receipt page
  return c.redirect(`http://localhost:3000/receipts/${receiptId}`)
})

// Start the server
const port = 3002
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
