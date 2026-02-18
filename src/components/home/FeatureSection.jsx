import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';


export default function FeatureSection() {
    const features = [
        { icon: <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />, title: '안전한 거래', desc: '본인 인증된 사용자만 거래할 수 있어\n안심하고 물건을 빌려줄 수 있습니다.' },
        { icon: <HandshakeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />, title: '합리적인 소비', desc: '필요할 때만 빌려 쓰고,\n잠자는 물건으로 수익을 창출하세요.' },
        { icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />, title: '쉬운 이웃 거래', desc: '내 주변 5km 이내의 이웃과\n직거래로 배송비 없이 이용하세요.' }
    ];

    return (
        <>
            {/* --- ✨ 서비스 소개 (Trust Section) --- */}
            <Box sx={{ py: 8, mt: 9, bgcolor: 'white', borderTop: '1px solid #eee' }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" sx={{ fontWeight: '900', textAlign: 'center', mb: 6, color: '#1a1a1a', letterSpacing: '-0.5px' }}>왜 Re:Borrow 인가요?</Typography>
                    <Grid container spacing={4}>
                        {features.map((feature, idx) => (
                            <Grid key={idx} size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
                                <Box sx={{ p: 4, height: '100%', borderRadius: 4, bgcolor: '#eeeeee', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' } }}>
                                    {feature.icon}
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>{feature.title}</Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{feature.desc}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </>
    );
}