import qrcode

# Ask the user for the link
link = input("Enter the link you want to convert to a QR code: ")

# Generate the QR code
qr = qrcode.QRCode(
    version=1,  # controls the size of the QR code
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,  # size of each box in the QR code
    border=4,  # thickness of the border
)
qr.add_data(link)
qr.make(fit=True)

# Create an image from the QR Code instance
img = qr.make_image(fill_color="black", back_color="white")

# Save the QR code as an image file
filename = "qrcode.png"
img.save(filename)

print(f"QR code saved as {filename}")
