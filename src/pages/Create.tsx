import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ethers } from "ethers";
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

import { useState } from 'react'
import { create as ipfsHttpClient } from 'ipfs-http-client'

import Web3Modal from 'web3modal'
import { useNavigate } from "react-router-dom";


import {
    nftaddress, nftmarketaddress
} from '../config'

import NFT from '../contracts/NFT.json'
import Market from '../contracts/NFTMarket.json'

export default function Games() {
    const client = ipfsHttpClient({ url: 'https://ipfs.infura.io:5001/api/v0' })
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")
    const [fileUrl, setFileUrl] = useState<null | string>(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })

    async function onChange(e: any) {
        const file = e.target.files[0]
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog: any) => console.log(`received: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }
    async function createMarket() {
        setLoadingMessage("create NFT...")
        setLoading(true);
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) return
        /* first, upload to IPFS */
        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
            createSale(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createSale(url: any) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        
        /* next, create the item */
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        setLoadingMessage("create sale...")

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        /* then list the item for sale on the marketplace */
        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
        await transaction.wait()
        setLoading(false);
        navigate("/");

    }

    return (
        <>
            <CssBaseline />
            <main>
                {/* Hero unit */}
                <Container sx={{ py: 8 }} maxWidth="md">
                    <Typography
                        component="h1"
                        variant="h2"
                        align="center"
                        color="#fff"
                        gutterBottom
                    >
                        IOTA COMMUNITY BOTS
                    </Typography>
                    {/* End hero unit */}
                </Container>
                <Container sx={{ py: 8 }} maxWidth="md">
                    <Grid
                        container
                        spacing={0}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                    // style={{ minHeight: '100vh' }}
                    >
                        <Grid item xs={8}>

                            <Typography
                                component="p"
                                variant="body1"
                                align="center"
                                color="#fff"
                                gutterBottom
                            >
                                Mint your own Community IOTABOTS!
                            </Typography>
                            <br />
                            <br />
                            <Box
                                component="form"
                                sx={{
                                    '& > :not(style)': { m: 1, margin: '20px' },
                                }}
                                noValidate
                                autoComplete="off"
                            >
                                <Input
                                    disabled={loading}
                                    placeholder="Bot Name"
                                    className=""
                                    onChange={(e: any) => updateFormInput({ ...formInput, name: e.target.value })}
                                />
                                <Input
                                    disabled={loading}
                                    placeholder="Bot Description"
                                    className=""
                                    onChange={(e: any) => updateFormInput({ ...formInput, description: e.target.value })}
                                />
                                <Input
                                    disabled={loading}
                                    type="number"
                                    placeholder="Bot Price in MIOTA"
                                    className=""
                                    onChange={(e: any) => updateFormInput({ ...formInput, price: e.target.value })}
                                />
                                <Input
                                    disabled={loading}
                                    type="file"
                                    name="Asset"
                                    className="my-4"
                                    onChange={onChange}
                                />
                                {
                                    fileUrl && (
                                        <img className="rounded mt-4" alt="upload" width="350" src={fileUrl} />
                                    )
                                }
                                <br />
                                <br />
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    
                                    { loading ? <CircularProgress color="primary" size="5em" /> : null }
                                    
                                    <Typography
                                        component="p"
                                        variant="body1"
                                        align="center"
                                        color="#fff"
                                        gutterBottom
                                    >
                                    { loading ? loadingMessage : "" }                                    
                                    </Typography>
                                    <br />
                                    <Button disabled={loading} variant="contained" onClick={createMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                                        Create NFT
                                    </Button>
                                    <br />
                                    <br />
                                    <Typography
                                        component="p"
                                        variant="body1"
                                        align="center"
                                        color="#fff"
                                        gutterBottom
                                    >
                                        You need to confirm twice on your Metamask Wallet.
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                </Container>
            </main>
        </>
    );
}