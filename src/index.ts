import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { html } from 'hono/html'

const app = new Hono()

interface Item {
  name: string
  genericName: string
  price: number
  department: string
}

interface ReceiptData {
  store: string
  date: string
  items: Item[]
  total: number
}

// Mock function to simulate receipt analysis
function mockReceiptAnalysis(): ReceiptData {
  return {
    "store": "Grocery Mart",
    "date": "2023-05-20",
    "items": [
      {
        "name": "Organic Bananas",
        "genericName": "Bananas",
        "price": 2.99,
        "department": "Produce"
      },
      {
        "name": "Whole Wheat Bread",
        "genericName": "Bread",
        "price": 3.49,
        "department": "Bakery"
      },
      {
        "name": "2% Milk",
        "genericName": "Milk",
        "price": 3.99,
        "department": "Dairy"
      },
      {
        "name": "Chicken Breast",
        "genericName": "Chicken",
        "price": 7.99,
        "department": "Meat"
      }
    ],
    "total": 18.46
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
    return c.json({ error: 'No file uploaded' }, 400)
  }

  // Use the mock function to generate receipt data
  const receiptData = mockReceiptAnalysis()

  try {
    // Send a POST request to localhost:3000/receipts
    const response = await fetch('http://localhost:3000/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return c.json({ 
        error: 'Error uploading receipt', 
        status: response.status,
        details: errorData 
      }, response.status as number)
    }

    const result = await response.json()

    // Redirect to the receipt page
    return c.redirect(`http://localhost:3000/receipts/${result.id}`)
  } catch (error) {
    console.error('Error uploading receipt:', error)
    return c.json({ 
      error: 'Error uploading receipt',
      details: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// Start the server
const port = 3002
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
