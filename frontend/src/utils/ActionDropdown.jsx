import React from 'react';
import { Button, Menu, MenuItem, ListItemIcon, Box } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useTranslation } from 'react-i18next';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import UpdateIcon from '@mui/icons-material/Update';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import InfoIcon from '@mui/icons-material/Info';

const ActionDropdown = ({ row, dropDownOptions, getFilteredOptions }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    // Use getFilteredOptions function passed from parent component
    const filteredOptions = getFilteredOptions ? getFilteredOptions(row, dropDownOptions) : dropDownOptions;
    const handleClick = (event) => {
        if (filteredOptions.length > 0) {
            setAnchorEl(event.currentTarget);
        }
    };
    const isDisabled = filteredOptions.length === 0;
    const handleClose = () => {
        setAnchorEl(null);
    }; 
    const { t, i18n } = useTranslation();

    return (
        <div>
            <Button
                sx={{
                    padding: '3px 10px',
                }}
                id="actions-menu-button"
                aria-controls="actions-menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="contained"
                color="primary"
                endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                onClick={handleClick}
                disabled={isDisabled}
            >
                {t('Actions')}
            </Button>
            {!isDisabled && (
                <Menu
                    id="actions-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'actions-menu-button',
                    }}
                >
                    {filteredOptions.map((option, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => {
                                if (option?.action) {
                                    option.action(row);
                                }
                                handleClose();
                            }}
                        >
                            <ListItemIcon>
                                {option?.icon}
                            </ListItemIcon>
                            {option?.label}
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </div >
    );
}

export default ActionDropdown;
