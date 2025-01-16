"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, RadioGroup, FormControlLabel, Radio, TextField, Button, Grid } from '@mui/material';

const SupportTicketCard = () => {
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');

    const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategory((event.target as HTMLInputElement).value);
    };

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const handleSubmit = () => {
        console.log('Category:', category);
        console.log('Message:', message);
    };

    return (
        <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
            <CardHeader
                title="Category"
                titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 500 } }}
            />
            <CardContent>
                {/* Category Options */}
                <RadioGroup
                    row
                    value={category}
                    onChange={handleCategoryChange}
                    sx={{ mb: 3, gap: 2 }}
                >
                    <FormControlLabel value="iPhone App" control={<Radio />} label="iPhone App" />
                    <FormControlLabel value="Android App" control={<Radio />} label="Android App" />
                    <FormControlLabel value="Timesheets" control={<Radio />} label="Timesheets" />
                    <FormControlLabel value="Admin Panel" control={<Radio />} label="Admin Panel" />
                    <FormControlLabel value="Other" control={<Radio />} label="Other" />
                </RadioGroup>

                {/* Message Text Field */}
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Your message here :"
                    value={message}
                    onChange={handleMessageChange}
                    sx={{ mb: 3 }}
                />

                {/* Submit Button */}
                <Grid container justifyContent="flex-start">
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#4B0082',
                            color: '#fff',
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#3A006B' }
                        }}
                        onClick={handleSubmit}
                    >
                        SUBMIT
                    </Button>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SupportTicketCard;
