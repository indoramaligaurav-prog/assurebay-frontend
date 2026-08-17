'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
// mui
import { Box, Button, Stack, Typography, IconButton, Alert, Grid } from '@mui/material';
import { FiCamera, FiX, FiRotateCw } from 'react-icons/fi';

/**
 * Camera-only evidence capture. Deliberately never renders a file-picker /
 * gallery input — the only way a photo gets into `files` is through
 * getUserMedia + a live canvas snapshot, so there's no "just upload any old
 * photo from your gallery" path in the UI.
 *
 * Honest limitation: on desktop this is enforced by the getUserMedia
 * permission prompt (a real, live camera feed). On mobile, if getUserMedia
 * isn't available for some reason, we fall back to a native
 * `<input capture="environment">`, which opens the device's camera app
 * directly rather than gallery on most mobile browsers — but that guarantee
 * is weaker than the live-preview path, since it's an OS/browser convention
 * rather than something we control. This is not cryptographic proof the
 * photo was captured live; a determined bad actor could still defeat it
 * (e.g. photographing a screen). It removes the trivial gallery-upload path,
 * nothing stronger.
 */
export default function EvidenceCapture({ minCount, maxCount = 6, onChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fallbackInputRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [captures, setCaptures] = useState([]); // [{ id, file, previewUrl }]

  useEffect(() => {
    return () => {
      stopCamera();
      captures.forEach((c) => URL.revokeObjectURL(c.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onChange?.(captures.map((c) => c.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captures]);

  const stopCamera = () => {
    streamRef.current?.getTracks()?.forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError(
        'Could not access your camera. Make sure you allow camera access, or use a device with a camera.'
      );
    }
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || captures.length >= maxCount) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `evidence-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        setCaptures((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, file, previewUrl }]);
      },
      'image/jpeg',
      0.9
    );
  };

  const removeCapture = (id) => {
    setCaptures((prev) => {
      const target = prev.find((c) => c.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((c) => c.id !== id);
    });
  };

  // fallback for browsers where getUserMedia isn't available — still
  // camera-first on mobile via the `capture` attribute, see note above
  const handleFallbackCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file || captures.length >= maxCount) return;
    const previewUrl = URL.createObjectURL(file);
    setCaptures((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, file, previewUrl }]);
    e.target.value = '';
  };

  const met = captures.length >= minCount;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
        Photo evidence
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Take at least {minCount} live photo{minCount === 1 ? '' : 's'} with your camera. Gallery uploads aren't
        accepted — this has to be captured now.
      </Typography>

      {cameraError && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          {cameraError}
          <Button size="small" sx={{ ml: 1 }} onClick={() => fallbackInputRef.current?.click()}>
            Use device camera instead
          </Button>
        </Alert>
      )}

      {!cameraActive ? (
        <Button variant="outlined" startIcon={<FiCamera />} onClick={startCamera} sx={{ mb: 1.5 }}>
          Turn on camera
        </Button>
      ) : (
        <Box sx={{ position: 'relative', mb: 1.5, borderRadius: 1, overflow: 'hidden', bgcolor: 'black' }}>
          <video ref={videoRef} playsInline muted style={{ width: '100%', display: 'block', maxHeight: 320 }} />
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ position: 'absolute', bottom: 12, left: 0, right: 0 }}
          >
            <Button
              variant="contained"
              startIcon={<FiCamera />}
              onClick={capturePhoto}
              disabled={captures.length >= maxCount}
            >
              Capture ({captures.length}/{maxCount})
            </Button>
            <IconButton onClick={stopCamera} sx={{ bgcolor: 'background.paper' }}>
              <FiX />
            </IconButton>
          </Stack>
        </Box>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        ref={fallbackInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFallbackCapture}
      />

      {captures.length > 0 && (
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {captures.map((c) => (
            <Grid item key={c.id} xs={4} sm={3}>
              <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', aspectRatio: '1 / 1' }}>
                <Box
                  component="img"
                  src={c.previewUrl}
                  alt="Evidence"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeCapture(c.id)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                  }}
                >
                  <FiX size={14} />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="caption" color={met ? 'success.main' : 'text.secondary'}>
        {captures.length} of {minCount} required photo{minCount === 1 ? '' : 's'} captured
      </Typography>
    </Box>
  );
}

EvidenceCapture.propTypes = {
  minCount: PropTypes.number.isRequired,
  maxCount: PropTypes.number,
  onChange: PropTypes.func
};