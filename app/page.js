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
import '../app/globals.css'; 

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [searchInput, setSearchInput] = useState('')

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

  const addItem = async (itemName, expirationDate) => {
    if (!itemName.trim()) {
      console.error('Item name is required');
      return;
    }

    const docRef = doc(collection(firestore, 'inventory'), itemName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const { quantity, expirationDate: existingExpirationDate } = existingData;

      await setDoc(docRef, {
        quantity: quantity + 1,
        expirationDate: existingExpirationDate,
      }, { merge: true });
    } else {
      await setDoc(docRef, {
        quantity: 1,
        expirationDate,
      });
    }

    await updateInventory();
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

  const filterInventory = (inventory, searchInput) => {
    if (!searchInput) {
      return inventory;
    }
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  };

  const filteredInventory = filterInventory(inventory, searchInput);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      overflow="hidden"
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
        width="90%"
        maxWidth="800px"
      >
        <Typography variant="h1" fontFamily={'cursive'} >KitchenKonnect</Typography>
        <Typography variant="h7" fontFamily={'inter'} sx={{ 
            marginBottom: '20px' , 
            width: '800px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',          
            borderRadius: '16px', 
            padding: '16px',
          }}>KitchenKonnect is your ultimate solution for a well-organized kitchen. 
          It seamlessly tracks your pantry inventory, provides expiration date feature and 
          smart shopping lists to prevent waste and keep your kitchen stocked. Designed for both busy 
          professionals and home cooks, KitchenKonnect simplifies meal planning and grocery shopping, 
          aking your kitchen experience more efficient and enjoyable.</Typography>
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
                  backgroundColor: '#803D3B', 
                  color: '#fff',
                  borderColor: '#fff', 
                  border: '1px solid', 
                  '&:hover': { 
                    backgroundColor: '#AF8260',
                    borderColor: '#fff', 
                   } 
                 }}
                onClick={() => {
                  if (itemName && expirationDate) {
                    addItem(itemName, expirationDate) 
                    setItemName('')
                    setExpirationDate('')
                    handleClose()
                  }
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#803D3B', '&:hover': { backgroundColor: '#AF8260' } }}
          onClick={() => handleOpen()}
        >
          Add New Item
        </Button>
        <TextField
          variant="outlined"
          label="Search items..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ 
            marginBottom: '20px' , 
            width: '400px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'black',
              },
              '&:hover fieldset': {
                borderColor: 'green', 
              },
              '&.Mui-focused fieldset': {
                borderColor: '#9CA986',
              },
            },
          }}
          InputLabelProps={{
            style: { color: '#000000' }
          }}
        />
        <Box 
        border="1px solid #333" 
        width="100%">
          <Box
            width="100%"
            height="100px"
            bgcolor="#FFE7E7"
            display="flex"
            justifyContent="center"
            alignItems="center"
            style={{
              backgroundColor:"#9CA986"
            }}
          >
            <Typography variant="h2" color='#333' sx={{ fontSize: '2.5rem', fontFamily: 'Cursive'}}>
              Inventory List
            </Typography>
          </Box>
          <Stack width="100%" height="300px" spacing={1} overflow="auto">
            {filteredInventory.map(({ name, quantity, expirationDate }) => {
              const formattedDate = expirationDate ? new Date(expirationDate).toLocaleDateString() : 'No Expiration Date'

              return (
                <Box
                  key={name}
                  width="100%"
                  minHeight="100px"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  padding={2}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography variant="h3" color="#000000" textAlign="center" sx={{ fontSize: '1.8rem' , fontFamily: 'NewTimesRoman'}}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h3" color="#111111" textAlign="center" sx={{ fontSize: '1.8rem' , fontFamily: 'NewTimesRoman'}}>
                    {quantity}
                  </Typography>
                  <Typography variant="h4" color="#222222" textAlign="center" sx={{ fontSize: '1.8rem' , fontFamily: 'NewTimesRoman'}}>
                    {formattedDate}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={() => addItem(name)} 
                      sx={{ backgroundColor: '#803D3B', '&:hover': { backgroundColor: '#AF8260' } }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: '#803D3B', '&:hover': { backgroundColor: '#AF8260' } }}
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
    </Box>
  )
}
