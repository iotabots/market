import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import InfiniteScroll from "react-infinite-scroll-component";


class List extends React.Component {

    componentDidMount() {
        window.scrollTo(0, 0);
    }
    
    state = {
        items: Array.from({ length: 20 }, (v, k) => k + 1)
    };
    fetchMoreData = () => {
        this.setState({
            items: this.state.items.concat(Array.from({ length: 20 }, (v, k) => k + 1 + this.state.items.length))
        });
    };
    render() {

        return (
            <>
                <InfiniteScroll
                    style={{ display: 'flex', flexDirection: 'row', flexWrap: "wrap", width: '100%', textAlign: 'center', justifyContent: 'center' }}
                    dataLength={this.state.items.length}
                    next={this.fetchMoreData}
                    hasMore={this.state.items.length >= 500 ? false : true}
                    loader={<h4>Loading...</h4>}
                >
                    {this.state.items.map((item, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                            <Card
                            // sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                                <CardMedia
                                    height="100%"
                                    component="img"
                                    image={`http://assets.iotabots.io/${index + 1}.png`}
                                    alt="IOTABOT"
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="h3">
                                        {`IOTABOT #${index + 1}`}
                                    </Typography>

                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </InfiniteScroll>
            </>
        );
    };
};

export default List;