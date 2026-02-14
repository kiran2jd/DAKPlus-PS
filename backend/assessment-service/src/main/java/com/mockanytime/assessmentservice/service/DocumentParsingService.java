package com.mockanytime.assessmentservice.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class DocumentParsingService {

    public String extractText(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null)
            return "";

        if (filename.toLowerCase().endsWith(".pdf")) {
            return extractFromPdf(file);
        } else if (filename.toLowerCase().endsWith(".docx")) {
            return extractFromWord(file);
        } else if (filename.toLowerCase().endsWith(".txt")) {
            return new String(file.getBytes());
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + filename);
        }
    }

    private String extractFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractFromWord(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream();
                XWPFDocument doc = new XWPFDocument(inputStream);
                XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            
            StringBuilder fullText = new StringBuilder(extractor.getText());
            
            // Extract images and perform OCR
            for (org.apache.poi.xwpf.usermodel.XWPFPictureData picture : doc.getAllPictures()) {
                try {
                    String ocrResult = performOcr(picture.getData());
                    if (ocrResult != null && !ocrResult.isBlank()) {
                        fullText.append("\n[Image Text]:\n").append(ocrResult).append("\n");
                    }
                } catch (Exception e) {
                    System.err.println("Failed to perform OCR on image: " + e.getMessage());
                }
            }
            
            return fullText.toString();
        }
    }

    private String performOcr(byte[] imageData) {
        try {
            net.sourceforge.tess4j.ITesseract instance = new net.sourceforge.tess4j.Tesseract();
            // Assuming tessdata is available in a standard location or environment variable
            // You might need to set datapath: instance.setDatapath("path/to/tessdata");
            
            // Create a temp file for the image
            java.io.File tempFile = java.io.File.createTempFile("ocr_image", ".png");
            java.nio.file.Files.write(tempFile.toPath(), imageData);
            
            String result = instance.doOCR(tempFile);
            tempFile.delete();
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}
