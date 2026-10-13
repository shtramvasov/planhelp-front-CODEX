import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { Box, Card, CircularProgress, Divider, Grid, Tooltip, Typography, useTheme, Button, IconButton } from '@mui/material';
import { ContentCopyOutlined, FileDownloadOutlined } from '@mui/icons-material';
import { Navbar }  from "../navbar/Navbar";
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';

import styles from './styles.module.css'

const FS_HOST = 'https://cdn.ds24.ru/fs/'

function Screen() {
  document.title = "Загрузить файл в DS24 | planhelp";

  const theme = useTheme();
  const dispatch = useDispatch();

  // Стейты
  const [selectedFile, setSelectedFile]       = useState(null);
  const [clipboardLink, setClipboardLink]     = useState(null);
  const [uploadingFile, setUploadingFile]     = useState(false);
  const [tooltip, setTooltip]                 = useState(false);


  // Обработчики
  const handleFileChange = (event) => {
    const eventType = event.type;   
    const validTypes = ['image/jpeg', 'image/png'];

    if(eventType == 'drop') event.preventDefault();

    let storage = event.target

    if(eventType == 'drop')     storage = event.dataTransfer
    if(eventType == 'paste')    storage = event.clipboardData

    // Обработка для вставки (paste)
    if (eventType === 'paste' && storage.items) {
      for (const item of storage.items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (validTypes.includes(file.type)) { 
            setSelectedFile(file);
            setClipboardLink(null);
            setUploadingFile(false);
            return;
          }
        }
      }
    }

    if(storage.files && storage.files.length > 0) {
      const selectedFile = storage.files[0]

      setSelectedFile(selectedFile)
      setClipboardLink(null)
      setUploadingFile(false)
    }
    
    if(eventType == 'change') event.target.value = ''
  };

  const uploadFile = async () => {
    try {
      if(selectedFile) {
        setUploadingFile(true)

        const response = await fetch(FS_HOST, {
          method: 'POST',
          body: selectedFile,
          headers: {
            'filename': encodeURI(selectedFile.name)
          },
        });

        if (!response.ok) {
          throw new Error('Произошла ошибка');
        }

        const result = await response.json();
        setClipboardLink(result.file)
        setUploadingFile(false)
        dispatch(addPositiveMessage('Файл загружен'));
      }
            
    } catch (error) {
        console.log(error)
        setSelectedFile(null)
        setClipboardLink(null)
        setUploadingFile(false)
        dispatch(addNegativeMessage('Произошла ошибка'));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(clipboardLink)

    dispatch(addPositiveMessage('Ссылка скопирована'));
  };



  useEffect(() => {
    document.addEventListener('paste', (event) => handleFileChange(event));

  }, [document]);


  return (
    <Box sx={{ px: { md: 0, lg: '12px' }, mx: 'auto' }}>
      <Row>
        <Col><Navbar /></Col>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pt: 4 }}>
            <Typography variant='body2' sx={{ fontSize: { xs: 21, md: 24 }, fontWeight: 500, color: theme.palette.grey[700] }} >
              Загрузить файл в DS24
            </Typography>

            <Card
              variant="outlined"
              sx={{
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 1.5,
                px: 0,
                boxShadow: (theme) => theme.shadows[1],
              }}
            >
              <Grid sx={{ display: 'flex', flexDirection: 'column', p: 0.5, px: 2 }}>
                <div onDrop={handleFileChange} onDragOver={(e) => e.preventDefault()} className={styles.file_input}>
                  <input
                    type="file"
                    id="fileInput"
                    // accept=".jpg,.jpeg,.png"
                    style={{ display: 'none', cursor: 'pointer' }}
                    onChange={handleFileChange}
                  />
                  <label style={{ cursor: 'pointer' }} htmlFor="fileInput">
                  <div className={styles.file_label}>
                    <FileDownloadOutlined className={styles.file_icon} />
                    <p><span>Нажмите здесь</span> для загрузки или перетащите файл</p>
                  </div>
                  </label>
                </div>

                {selectedFile && (
                  <>
                    <Divider sx={{ pb: 2 }}/>
                    <div className={styles.preview}>
                      <div className={styles.imageWrapper}>
                        {selectedFile.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(selectedFile)} alt={selectedFile.name}/>
                          ) : (
                          <p>{selectedFile.name}</p>
                        )}
                        {uploadingFile && (
                          <div className={styles.spinner}>
                            <CircularProgress className={styles.spinnerIcon} />
                          </div>
                        )}
                      </div>
                      <div className={styles.preview_buttons}>
                        <div className={styles.clipboard}>
                          <span 
                            onClick={copyToClipboard}
                            onMouseEnter={() => setTooltip(true)}
                            onMouseLeave={() => setTooltip(false)}
                          >
                            <Tooltip title={tooltip ? 'Скопировать ссылку' : ''}>
                              <ContentCopyOutlined sx={{ fontSize: 18, m: 0.5 }} />
                            </Tooltip>
                          </span>
                          <p>{clipboardLink}</p>             
                        </div>
                        <Button variant='contained' color='secondary' disabled={uploadingFile} onClick={uploadFile}>Загрузить</Button>
                      </div>
                    </div>
                  </>
                )}
              </Grid>
            </Card>
          </Box>
    </Row>
    </Box>
  )
}

export default Screen