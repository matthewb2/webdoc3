# DOC3
Typescript Wordprocessor based on modern web technology

# dependency
hwp.js https://github.com/hahnlee/hwp.js.git

hwplib-js https://github.com/erickim20/hwplib-js.git

# Structure
The top most abstraction is DocumentModel

## Read
odt,  hwpx, docx -> DocumentModel

## Input
Layout and rendering are handled asynchronously. Input, however, must not be handled asynchronously; doing so would disrupt the cursor.

## Write
DocumentModel
-> odt,  hwpx, docx
-> hwpFile -> hwp




