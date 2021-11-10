import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { NavLink } from "react-router-dom";
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Twitter from '@mui/icons-material/Twitter';
import Web3Modal from 'web3modal'
import CircularProgress from '@mui/material/CircularProgress';

import {
    nftaddress, nftmarketaddress
} from '../config'

import NFT from '../contracts/NFT.json'
import Market from '../contracts/NFTMarket.json'

export default function Home() {

    // const [nfts, setNfts] = useState([])
    const [nfts, setNfts] = useState<any[] | []>([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        loadNFTs()
    }, [])
    async function loadNFTs() {
        const provider = new ethers.providers.JsonRpcProvider("https://evm.wasp.sc.iota.org")

        // const provider = new ethers.providers.JsonRpcProvider()
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)

        const data = await marketContract.fetchMarketItems()

        const items = await Promise.all(data.map(async (i: any) => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
            }
            return item
        }))

        console.log("nfts", items)
        setNfts(items.reverse())
        setLoadingState('loaded')
    }

    async function buyNft(nft: any) {

        console.log("nft", nft)
        
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        
        const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
            value: price
        })
        console.log("transaction", transaction)
        await transaction.wait()
        loadNFTs()
    }

    if (loadingState === 'loaded' && !nfts.length) return (<h1>No items in marketplace</h1>)
    if (loadingState === 'not-loaded' ) return ( <> <h1>Loading</h1><CircularProgress /></>)

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
                        Community Marketplace
                    </Typography>
                    {/* End hero unit */}
                    <Grid container spacing={4}>
                        {nfts.map((nft, index) => (
                            <Grid item key={index} xs={12} sm={6} md={6}>
                                <Card
                                    sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                >
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            // 16:9
                                            // pt: '56.25%',
                                        }}
                                        image={nft.image}
                                        alt="IOTABOT"
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h6" component="h3">
                                            {nft.name}
                                        </Typography>
                                        <Typography paragraph>
                                            {nft.description}
                                        </Typography>
                                        <br />
                                        <hr />
                                        <br />
                                        <Typography paragraph>
                                            Price:
                                        </Typography>
                                        <Typography gutterBottom variant="h6" component="h6">
                                            {nft.price} MIOTA
                                        </Typography>
                                    </CardContent>
                                    <CardActions disableSpacing>
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            className="card-button"
                                            // flexDirection="column"
                                        >
                                            <Button onClick={() => buyNft(nft)} variant="outlined" size="large">BUY</Button>
                                            <IconButton target="_blank" href={`https://twitter.com/intent/tweet?url=${nft.image}&hashtags=IOTA,IOTABOTS,NFT&text=Community%20IOTABOTS%20Nr.%20${nft.tokenId}`} size="large" aria-label="twitter" color="inherit">
                                                <Twitter />
                                            </IconButton>
                                        </Box>

                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                </Container>
                <Container sx={{ py: 8 }} maxWidth="md"  >
                    <Typography align="center" gutterBottom variant="button" component="h1">
                        <NavLink to="/create">
                            Create your IOTABOTS Community NFT now!
                        </NavLink>
                    </Typography>
                </Container>

            </main>
        </>
    );
}