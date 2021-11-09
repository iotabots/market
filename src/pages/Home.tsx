import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { NavLink } from "react-router-dom";
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'

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
        setNfts(items)
        setLoadingState('loaded')
    }

    // async function buyNft(nft: any) {
    //     const web3Modal = new Web3Modal()
    //     const connection = await web3Modal.connect()
    //     const provider = new ethers.providers.Web3Provider(connection)
    //     const signer = provider.getSigner()
    //     const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    //     const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    //     const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
    //         value: price
    //     })
    //     await transaction.wait()
    //     loadNFTs()
    // }

    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)

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
                            <Grid item key={index} xs={12} sm={6} md={4}>
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
                                        <Typography gutterBottom variant="body2" component="p">
                                            {nft.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                </Container>
                <Container sx={{ py: 8 }} maxWidth="md"  >
                    <Typography align="center" gutterBottom variant="button" component="h1">
                        <NavLink to="/bots">
                            Discover all 500 IOTABOTS
                        </NavLink>
                    </Typography>
                </Container>

            </main>
        </>
    );
}