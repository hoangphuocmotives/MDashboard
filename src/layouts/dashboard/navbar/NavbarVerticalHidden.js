import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import { Box, Drawer, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
// hooks
import useAuth from '../../../hooks/useAuth';
import useCollapseDrawer from '../../../hooks/useCollapseDrawer';
import useResponsive from '../../../hooks/useResponsive';
// utils
import cssStyles from '../../../utils/cssStyles';
// config
import { APP_VERSIONS, NAVBAR } from '../../../config';
// components
import Logo from '../../../components/Logo';
import { NavSectionVertical } from '../../../components/nav-section';
import Scrollbar from '../../../components/Scrollbar';
import navConfig from './NavConfig';
import BigLogo from '../../../components/BigLogo';
import Iconify from '../../../components/Iconify';
import useLocales from '../../../hooks/useLocales';
import IconName from '../../../utils/iconsName';
import CollapseButton from './CollapseButton';

// ----------------------------------------------------------------------
const RootStyle = styled('div')(({ theme }) => ({
    position: 'absolute',
    zIndex: theme.zIndex.drawer + 1,
    [theme.breakpoints.up('lg')]: {
        flexShrink: 0,
        transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.shorter,
        }),
    },
}));

// ----------------------------------------------------------------------

NavbarVerticalHidden.propTypes = {
    isOpenSidebar: PropTypes.bool,
    onCloseSidebar: PropTypes.func,
};

const getAppInfo = async () => {
    const info = await App.getInfo();
    return info
};

// ---------------------------------------------------------------------

export default function NavbarVerticalHidden({ isOpenSidebar, onCloseSidebar }) {
    const theme = useTheme();

    const { translate } = useLocales();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, userClaim } = useAuth();
    // ref
    // componets state;
    const [search, setSearch] = useState('');
    const [userNavbar, setUserNavbar] = useState([]);
    const [appVersion, setAppVersion] = useState(null)
    const isWebApp = Capacitor.getPlatform() === 'web';
    const isDesktop = useResponsive('up', 'lg');

    const { isCollapse, collapseClick, collapseHover, onToggleCollapse, onHoverEnter, onHoverLeave, onToggleDrawer } =
        useCollapseDrawer();

    useEffect(() => {
        if (!isWebApp) {
            getAppInfo().then(res => {
                setAppVersion(res)
            });
        };
    }, []);

    useEffect(() => {
        if (pathname === '/tqa/map/overall' || pathname === "/tqa/map/factory_profile") {
            onToggleDrawer();
        }
    }, [pathname])

    useEffect(() => {
        const newUserClaim = navConfig[0].items.reduce((acc, a) => {
            if (a.title.toLowerCase() === "home"
            ) {
                acc.push(a);
            }
            (userClaim || []).forEach(d => {
                const groupIndex = acc.findIndex(group => group.id.toLowerCase() === d.ClaimType.toLowerCase())
                if (groupIndex < 0) {
                    if (a.children === undefined && a.id.toLowerCase() === d.ClaimType.toLowerCase()) {
                        acc.push(a);
                    } else {
                        const ch = a.children && a.children.filter((b) => b.id.toLowerCase() === d.ClaimType.toLowerCase());
                        if (ch && ch.length) {
                            acc.push({ ...a, children: ch });
                        }
                    }
                }
            });
            return acc;
        }, []) || [];

        const navbarWithSearch =
            search === ''
                ? [{ items: newUserClaim }]
                : [
                    {
                        items: newUserClaim.reduce((acc, a) => {
                            const ch = a.children && a.children.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));
                            if (ch && ch.length) acc.push({ ...a, children: ch });
                            return acc;
                        }, []),
                    },
                ];

        setUserNavbar(navbarWithSearch);
    }, [search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const renderTop = (
        <>
            <Stack
                spacing={3}
                sx={{
                    pt: 3,
                    pb: 2,
                    px: 2.5,
                    flexShrink: 0,
                    ...(isCollapse && { alignItems: 'center' }),
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" columnGap={2}>

                    {!isCollapse ? (
                        <BigLogo />
                    ) : (
                        <Logo />
                    )}

                    {isDesktop && !isCollapse && (
                        <CollapseButton onToggleCollapse={() => {
                            onToggleDrawer()
                        }} collapseClick={collapseClick} />
                    )}

                </Stack>
            </Stack>

            <RenderTextField search={search} handleSearch={handleSearch} setSearch={setSearch} placeholder={translate('search')} />
        </>
    )

    const renderContent = (
        <Scrollbar
            sx={{
                height: 1,
                maxHeight: `77vh`,
                '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
                position: 'relative',
                pb: 3,
            }}
        >

            {userNavbar.length > 0 ? (
                <NavSectionVertical
                    navConfig={userNavbar}
                    isCollapse={isCollapse}
                    search={search}
                />
            ) : (
                <Box px={2} mb={0} mt={2}>
                    <Typography>No result match with your search</Typography>
                </Box>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {!isCollapse && (
                <Stack
                    sx={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 1,
                        p: 1,
                        position: 'fixed',
                        bottom: 1,
                        left: 1,
                        right: 1,
                        width: NAVBAR.DASHBOARD_WIDTH,
                        ...(isCollapse && {
                            width: 0
                        }),
                        ...(collapseHover && {
                            boxShadow: (theme) => theme.customShadows.z24,
                        }),
                    }}
                    justifyContent="center"
                    alignItems={'center'}
                >
                    <Typography variant="caption"
                    >Version: {appVersion === null ? APP_VERSIONS.version : appVersion.version}</Typography>
                </Stack>
            )}

        </Scrollbar>
    );

    return (
        <RootStyle
            sx={{
                width: {
                    lg: isCollapse ? NAVBAR.DASHBOARD_COLLAPSE_WIDTH : NAVBAR.DASHBOARD_WIDTH,
                },
                ...(collapseClick && {
                    position: 'absolute',
                }),
            }}
        >
            {!isDesktop && (
                <Drawer open={isOpenSidebar} onClose={onCloseSidebar} PaperProps={{
                    sx: {
                        width: NAVBAR.DASHBOARD_WIDTH,
                        // pb: 2
                    }
                }}>
                    {renderTop}
                    {renderContent}
                </Drawer>
            )}

            {isDesktop && (
                <Drawer
                    open={isOpenSidebar}
                    onClose={onCloseSidebar}
                    variant="persistent"
                    onMouseEnter={onHoverEnter}
                    onMouseLeave={onHoverLeave}
                    PaperProps={{
                        sx: {
                            width: NAVBAR.DASHBOARD_WIDTH,
                            borderRightStyle: 'dashed',
                            bgcolor: 'background.default',
                            transition: (theme) =>
                                theme.transitions.create('width', {
                                    duration: theme.transitions.duration.standard,
                                }),
                            ...(isCollapse && {
                                width: 0
                            }),
                            ...(collapseHover && {
                                ...cssStyles(theme).bgBlur(),
                                boxShadow: (theme) => theme.customShadows.z24,
                            }),
                        },
                    }}
                >
                    {renderTop}
                    {renderContent}
                </Drawer>
            )}
        </RootStyle>
    );
}



function RenderTextField({ search, handleSearch, setSearch, placeholder }) {

    return (
        <Box px={2} mb={0} mt={2}>
            <TextField
                placeholder={placeholder}
                size="small"
                variant="outlined"
                value={search}
                onChange={(e) => handleSearch(e)}
                fullWidth
                hiddenLabel
                id='search-bar-custom'
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Iconify icon={IconName.search} />
                        </InputAdornment>
                    ),
                    ...(search !== '' && {
                        endAdornment: (
                            <InputAdornment position="start">
                                <IconButton
                                    onClick={() => {
                                        setSearch('');
                                    }}
                                >
                                    <Iconify icon={IconName.close} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }),
                }}
            />
        </Box>
    )
}