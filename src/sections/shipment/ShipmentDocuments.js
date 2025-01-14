import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
// pfd image
// hook
import useIsMountedRef from '../hooks/useIsMountedRef';
import useLocales from '../hooks/useLocales';
// Icon
import IconName from '../utils/iconsName';
import Iconify from './Iconify';
// Redux

import Scrollbar from './Scrollbar';

const ShipmentDocument = ({
  // currentProduct, isAddOrEdit, attachment, api, id, onClose,
  ...other
}) => {
  // Props

  // ShipmentDocument.propTypes = {
  //   currentProduct: PropTypes.object,
  //   isAddOrEdit: PropTypes.bool,
  //   attachment: PropTypes.array,
  //   api: PropTypes.string,
  //   onClose: PropTypes.func,
  // };

  // hook
  const { translate } = useLocales();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  if (other.WFInstanceDocument === null) {
    return null;
  }

  const WFInstanceDocument = _.groupBy(other.WFInstanceDocument, (o) => o.SysNo);

  return (
    <Box>
      <Typography paragraph variant="overline">
        {translate('attachment')}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Scrollbar sx={{ height: 300 }}>
        {other.WFInstanceDocument.length > 0 ? (
          Object.keys(WFInstanceDocument).map((key, index) => {
            return (
              <Stack
                key={key}
                display="flex"
                justifyContent={'flex-start'}
                sx={{
                  width: '100%',
                }}
              >
                <Typography variant="caption" mb={2} mt={1} sx={{ width: '100%', fontWeight: 'bold' }}>
                  Sys No: {key}
                </Typography>
                {WFInstanceDocument[key].map((d) => (
                  <RenderElement d={d} {...other} key={d.Id} />
                ))}
              </Stack>
            );
          })
        ) : (
          <Typography variant="body2" sx={{ width: '100%', textAlign: 'center' }}>
            {translate('noFileText')}
          </Typography>
        )}
      </Scrollbar>

      {other.WFInstanceDocument.length >= 3 && (
        <div className="absolute right-0 top-[50%] flex flex-col">
          <Iconify icon={'gg:scroll-v'} className="text-3xl text-[color:var(--icon)]" />
        </div>
      )}
    </Box>
  );
};

export default ShipmentDocument;

const RenderElement = ({ d, ...other }) => {
  RenderElement.propTypes = {
    d: PropTypes.object,
  };

  const isMountedRef = useIsMountedRef();
  function extension(Name) {
    const r = /.+\.(.+)$/.exec(Name);
    return r ? r[1] : null;
  }
  const fileExtension = extension(d.Name);
  const theme = useTheme();
  const isPdf = fileExtension === 'pdf';
  const isImage = ['jpeg', 'png', 'jpg', 'gif'].includes(fileExtension.toLowerCase());
  const isMSg = fileExtension === 'msg';
  const isXlsx = fileExtension === 'xlsx' || fileExtension === 'xlx';
  const isDoc = fileExtension === 'docx' || fileExtension === 'doc';

  const { setOpenLightbox, setSelectedImage, imagesLightbox } = other;

  const handleOpenImage = () => {
    if (isMountedRef.current) {
      const imgIndex = imagesLightbox.findIndex((img) => img === `${d.URL}`);
      setOpenLightbox(true);
      setSelectedImage(imgIndex >= 0 ? imgIndex : 0);
    }
  };

  if (isPdf) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`${d.URL}`}
        className="flex flex-row justify-start items-center min-h-[30px]"
      >
        <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
          <Iconify icon={IconName.pdf} color={theme.palette.error.main} sx={{ height: 30, width: 30, m: 0, p: 0 }} />
        </Box>
        <Typography variant="body2" paragraph ml={2}>
          {d.Name}
        </Typography>
      </a>
    );
  }

  if (isImage) {
    return (
      <Stack direction="row" alignItems="center" onClick={() => handleOpenImage()}>
        <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
          <Iconify
            icon={IconName.image}
            color={theme.palette.warning.dark}
            sx={{ height: 30, width: 30, m: 0, p: 0 }}
          />
        </Box>
        <Typography variant="body2" paragraph ml={2}>
          {d.Name}
        </Typography>
      </Stack>
    );
  }

  if (isMSg) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={d.URL}
        className="flex flex-row justify-start items-center min-h-[30px]"
      >
        <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
          <Iconify
            icon={IconName.outlook}
            color={theme.palette.warning.dark}
            sx={{ height: 30, width: 30, m: 0, p: 0 }}
          />
        </Box>

        <Typography variant="body2" paragraph ml={2}>
          {d.Name}
        </Typography>
      </a>
    );
  }

  if (isXlsx || isDoc) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://docs.google.com/viewerng/viewer?url=${d.URL}`}
        className="flex flex-row justify-start items-center min-h-[30px]"
      >
        <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
          <Iconify
            icon={isXlsx ? IconName.excel : IconName.word}
            color={isXlsx ? theme.palette.success.dark : theme.palette.info.dark}
            sx={{ height: 30, width: 30, m: 0, p: 0 }}
          />
        </Box>
        <Typography variant="body2" paragraph ml={2}>
          {d.Name}
        </Typography>
      </a>
    );
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={d.URL}
      className="flex flex-row justify-start items-center min-h-[30px]"
    >
      <Box sx={{ width: 40 }} justifyContent="center" alignItems={'center'}>
        <Iconify icon={IconName.document} color={theme.palette.grey[500]} sx={{ height: 30, width: 30, m: 0, p: 0 }} />
      </Box>
      <Typography variant="body2" paragraph ml={2}>
        {d.Name}
      </Typography>
    </a>
  );
};
