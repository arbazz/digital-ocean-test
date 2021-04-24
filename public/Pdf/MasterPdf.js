

const MasterPDf = (data) => {

    return (
        ` <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Id</title>
    <style>
        .img {

        }

        .conteinare {
            display: flex;
            align-items: center;
            height: 100vh;
            flex-direction: column;
            margin-top: 30px;
        }
    </style>
</head>

<body>
    ${data}

    <script type="text/javascript">
      function AdjustIFrame(id) {
          var frame = document.getElementById(id);
          var maxW = frame.scrollWidth;
          var minW = maxW;
          var FrameH = 100; //IFrame starting height
          frame.style.height = FrameH + "px"
  
          while (minW == maxW) {
              FrameH = FrameH + 100; //Increment
              frame.style.height = FrameH + "px";
              minW = frame.scrollWidth;
          }
      }
  
     </script>
</body>

</html>`
    )
};

module.exports = MasterPDf;