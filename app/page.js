'use client'
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Modal, Typography, Stack, TextField, Button } from '@mui/material'
import { 
  collection, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  getDoc, 
  setDoc 
} from 'firebase/firestore'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [expirationDate, setExpirationDate] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1, expirationDate }, { merge: true })
    } else {
      await setDoc(docRef, { quantity: 1, expirationDate })
    }

    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true })
      }
    }

    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      width="200vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              label="Expiration Date"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                placeholder: '',
              }}
            />
            <Button
              variant="outlined"
              sx={{ 
                backgroundColor: '#944E63', 
                color: '#fff', // Text color
                borderColor: '#fff', // Border color
                border: '1px solid', // Border width
                '&:hover': { 
                  backgroundColor: '#CAA6A6',
                  borderColor: '#fff', // Ensure border color remains white on hover
                }  }}
              onClick={() => {
                addItem()
                setItemName('')
                setExpirationDate('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button
        variant="contained"
        sx={{ backgroundColor: '#944E63', '&:hover': { backgroundColor: '#CAA6A6' } }}
        onClick={() => handleOpen()}
      >
        Add New Item
      </Button>
      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          bgcolor="#FFE7E7"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h2" color='#333' sx={{ fontSize: '2.5rem' }}>
            Pantry Track
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={1} overflow="auto">
          {inventory.map(({ name, quantity, expirationDate }) => {
            const formattedDate = expirationDate ? new Date(expirationDate).toLocaleDateString() : 'No Expiration Date'

            return (
              <Box
                key={name}
                width="100%"
                minHeight="100px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgColor="#f0f0f0"
                padding={2}
              >
                <Typography variant="h3" color="#333" textAlign="center" sx={{ fontSize: '1.8rem' }}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h3" color="#333" textAlign="center" sx={{ fontSize: '1.8rem' }}>
                  {quantity}
                </Typography>
                <Typography variant="h4" color="#777" textAlign="center" sx={{ fontSize: '1.8rem' }}>
                  {formattedDate}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => addItem(name)}
                    sx={{ backgroundColor: '#944E63', '&:hover': { backgroundColor: '#CAA6A6' } }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#944E63', '&:hover': { backgroundColor: '#CAA6A6' } }}
                    onClick={() => removeItem(name)}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}